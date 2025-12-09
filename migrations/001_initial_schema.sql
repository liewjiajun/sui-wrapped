-- Sui Wrapped Database Schema
-- Version: 1.0.0
-- Database: PostgreSQL 15+ with TimescaleDB extension

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Checkpoints table: Tracks Sui blockchain checkpoints
CREATE TABLE checkpoints (
    sequence_number         BIGINT PRIMARY KEY,
    checkpoint_digest       BYTEA NOT NULL UNIQUE,
    epoch                   BIGINT NOT NULL,
    timestamp_ms            BIGINT NOT NULL,
    total_gas_cost          BIGINT NOT NULL,
    total_transactions      INTEGER NOT NULL,
    end_of_epoch_data       JSONB,
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checkpoints_epoch ON checkpoints(epoch);
CREATE INDEX idx_checkpoints_timestamp ON checkpoints(timestamp_ms);

-- Transactions table: Core transaction data
CREATE TABLE transactions (
    tx_digest               BYTEA PRIMARY KEY,
    checkpoint_sequence     BIGINT NOT NULL REFERENCES checkpoints(sequence_number),
    sender                  BYTEA NOT NULL,
    gas_budget              BIGINT NOT NULL,
    gas_price               BIGINT NOT NULL,
    gas_used                BIGINT NOT NULL,
    status                  VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failure')),
    timestamp_ms            BIGINT NOT NULL,

    -- PTB Metadata
    command_count           INTEGER NOT NULL,
    input_object_count      INTEGER NOT NULL,

    -- Raw data for reprocessing
    transaction_data        JSONB NOT NULL,
    effects                 JSONB NOT NULL,
    events                  JSONB,

    created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_sender ON transactions(sender);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp_ms);
CREATE INDEX idx_transactions_checkpoint ON transactions(checkpoint_sequence);

-- ============================================================================
-- PTB DECOMPOSITION
-- ============================================================================

-- Commands decomposed: Individual actions from PTBs
CREATE TABLE commands_decomposed (
    id                      BIGSERIAL PRIMARY KEY,
    tx_digest               BYTEA NOT NULL REFERENCES transactions(tx_digest),
    command_index           INTEGER NOT NULL,

    -- Command Classification
    command_type            VARCHAR(50) NOT NULL,
    action_category         VARCHAR(50) NOT NULL,

    -- Protocol Attribution
    protocol_name           VARCHAR(100),
    protocol_package        BYTEA,
    protocol_module         VARCHAR(100),
    protocol_function       VARCHAR(100),

    -- Value Extraction
    token_in_type           VARCHAR(500),
    token_in_amount         NUMERIC(78, 0),
    token_out_type          VARCHAR(500),
    token_out_amount        NUMERIC(78, 0),

    -- DEX: Maker vs Taker
    order_type              VARCHAR(20),
    is_maker                BOOLEAN,

    -- Lending: Health factor context
    health_factor_before    NUMERIC(20, 10),
    health_factor_after     NUMERIC(20, 10),

    -- Raw command data
    command_data            JSONB NOT NULL,

    created_at              TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tx_digest, command_index)
);

CREATE INDEX idx_commands_protocol ON commands_decomposed(protocol_name);
CREATE INDEX idx_commands_action ON commands_decomposed(action_category);
CREATE INDEX idx_commands_category_protocol ON commands_decomposed(action_category, protocol_name);

-- ============================================================================
-- EVENTS
-- ============================================================================

-- Events enriched: Parsed and enriched Move events
CREATE TABLE events_enriched (
    id                      BIGSERIAL PRIMARY KEY,
    tx_digest               BYTEA NOT NULL REFERENCES transactions(tx_digest),
    event_sequence          INTEGER NOT NULL,

    -- Event Identification
    package_id              BYTEA NOT NULL,
    module_name             VARCHAR(100) NOT NULL,
    event_type              VARCHAR(500) NOT NULL,
    event_type_short        VARCHAR(100) NOT NULL,

    -- Parsed Event Data
    event_data              JSONB NOT NULL,

    -- Enrichment Fields
    protocol_name           VARCHAR(100),
    action_category         VARCHAR(50),

    -- Token movements
    token_type              VARCHAR(500),
    token_amount            NUMERIC(78, 0),
    usd_value_at_time       NUMERIC(20, 4),

    -- NFT specific
    nft_object_id           BYTEA,
    nft_collection          VARCHAR(200),
    royalty_paid            NUMERIC(78, 0),

    created_at              TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tx_digest, event_sequence)
);

CREATE INDEX idx_events_protocol ON events_enriched(protocol_name);
CREATE INDEX idx_events_type ON events_enriched(event_type_short);
CREATE INDEX idx_events_action ON events_enriched(action_category);

-- ============================================================================
-- OBJECT OWNERSHIP (for historical balance reconstruction)
-- ============================================================================

CREATE TABLE object_ownership_history (
    id                      BIGSERIAL PRIMARY KEY,
    object_id               BYTEA NOT NULL,
    object_version          BIGINT NOT NULL,

    -- Ownership
    owner_address           BYTEA,
    owner_type              VARCHAR(20) NOT NULL CHECK (owner_type IN ('address', 'object', 'shared', 'immutable')),

    -- Object Type
    object_type             VARCHAR(500) NOT NULL,
    is_coin                 BOOLEAN DEFAULT FALSE,
    coin_type               VARCHAR(500),

    -- Value tracking (for coins)
    balance                 NUMERIC(78, 0),

    -- Mutation context
    tx_digest               BYTEA NOT NULL,
    checkpoint_sequence     BIGINT NOT NULL,
    timestamp_ms            BIGINT NOT NULL,

    -- Status
    status                  VARCHAR(20) NOT NULL CHECK (status IN ('created', 'mutated', 'deleted', 'wrapped')),

    created_at              TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(object_id, object_version)
);

CREATE INDEX idx_ownership_owner ON object_ownership_history(owner_address, timestamp_ms);
CREATE INDEX idx_ownership_object ON object_ownership_history(object_id);
CREATE INDEX idx_ownership_coin_type ON object_ownership_history(coin_type) WHERE is_coin = TRUE;

-- ============================================================================
-- AGGREGATED METRICS
-- ============================================================================

-- Daily user metrics (pre-aggregated for performance)
CREATE TABLE user_metrics_daily (
    address                 BYTEA NOT NULL,
    date                    DATE NOT NULL,

    -- Transaction counts
    tx_count                INTEGER DEFAULT 0,
    command_count           INTEGER DEFAULT 0,

    -- Gas
    gas_spent_mist          BIGINT DEFAULT 0,

    -- Volume by category
    swap_volume_usd         NUMERIC(20, 4) DEFAULT 0,
    swap_count              INTEGER DEFAULT 0,
    maker_volume_usd        NUMERIC(20, 4) DEFAULT 0,
    taker_volume_usd        NUMERIC(20, 4) DEFAULT 0,

    lending_supply_usd      NUMERIC(20, 4) DEFAULT 0,
    lending_borrow_usd      NUMERIC(20, 4) DEFAULT 0,

    staking_amount_sui      NUMERIC(20, 9) DEFAULT 0,
    unstaking_amount_sui    NUMERIC(20, 9) DEFAULT 0,

    nft_bought_count        INTEGER DEFAULT 0,
    nft_sold_count          INTEGER DEFAULT 0,
    nft_volume_usd          NUMERIC(20, 4) DEFAULT 0,
    royalties_paid_usd      NUMERIC(20, 4) DEFAULT 0,

    -- Protocol interaction
    protocols_used          TEXT[],

    -- Minimum health factor that day
    min_health_factor       NUMERIC(20, 10),

    PRIMARY KEY (address, date)
);

CREATE INDEX idx_daily_metrics_date ON user_metrics_daily(date);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('user_metrics_daily', 'date', if_not_exists => TRUE);

-- ============================================================================
-- WRAPPED CACHE
-- ============================================================================

-- User wrapped cache: Pre-computed wrapped results
CREATE TABLE user_wrapped_cache (
    address                 BYTEA NOT NULL,
    year                    INTEGER NOT NULL,

    -- Computed Wrapped Data
    wrapped_data            JSONB NOT NULL,

    -- Persona
    persona                 VARCHAR(50) NOT NULL,
    persona_confidence      NUMERIC(5, 4),

    -- Key metrics (denormalized)
    first_tx_timestamp      BIGINT,
    total_transactions      INTEGER,
    total_commands          INTEGER,
    total_gas_mist          BIGINT,
    total_protocols         INTEGER,
    gas_saved_usd           NUMERIC(20, 4),

    -- Generation metadata
    generated_at            TIMESTAMPTZ DEFAULT NOW(),
    indexer_checkpoint      BIGINT NOT NULL,

    PRIMARY KEY (address, year)
);

-- ============================================================================
-- PROTOCOL REGISTRY
-- ============================================================================

CREATE TABLE protocol_registry (
    protocol_name           VARCHAR(100) PRIMARY KEY,
    display_name            VARCHAR(100) NOT NULL,
    category                VARCHAR(50) NOT NULL CHECK (category IN ('dex', 'lending', 'lst', 'nft', 'bridge', 'other')),
    package_ids             BYTEA[] NOT NULL,
    current_package         BYTEA NOT NULL,
    website                 VARCHAR(500),
    logo_url                VARCHAR(500),
    comparable_eth_protocol VARCHAR(100),

    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GAS EQUIVALENCE (for ETH comparison)
-- ============================================================================

CREATE TABLE gas_equivalence (
    action_category         VARCHAR(50) NOT NULL,
    protocol_type           VARCHAR(50) NOT NULL,
    eth_gas_units           BIGINT NOT NULL,
    eth_protocol_reference  VARCHAR(100) NOT NULL,
    data_source             VARCHAR(200),
    last_updated            TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (action_category, protocol_type)
);

-- ============================================================================
-- PRICE HISTORY (for USD conversions)
-- ============================================================================

CREATE TABLE price_history (
    token_type              VARCHAR(500) NOT NULL,
    timestamp_ms            BIGINT NOT NULL,
    price_usd               NUMERIC(20, 8) NOT NULL,
    source                  VARCHAR(100) NOT NULL,

    PRIMARY KEY (token_type, timestamp_ms)
);

-- Convert to hypertable
SELECT create_hypertable('price_history', 'timestamp_ms', chunk_time_interval => 86400000, if_not_exists => TRUE);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Protocol registry seed data
INSERT INTO protocol_registry (protocol_name, display_name, category, package_ids, current_package, website, comparable_eth_protocol) VALUES
('cetus', 'Cetus', 'dex', ARRAY[E'\\x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb']::BYTEA[], E'\\x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb', 'https://cetus.zone', 'uniswap_v3'),
('turbos', 'Turbos Finance', 'dex', ARRAY[E'\\x91bfbc386a41afcfd9b2533058d7e915a1d3829089cc268ff4333d54d6339ca1']::BYTEA[], E'\\x91bfbc386a41afcfd9b2533058d7e915a1d3829089cc268ff4333d54d6339ca1', 'https://turbos.finance', 'uniswap_v3'),
('deepbook', 'DeepBook', 'dex', ARRAY[E'\\xdee9']::BYTEA[], E'\\xdee9', 'https://deepbook.tech', 'dydx'),
('aftermath', 'Aftermath Finance', 'dex', ARRAY[E'\\xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf']::BYTEA[], E'\\xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf', 'https://aftermath.finance', 'curve'),
('scallop', 'Scallop', 'lending', ARRAY[E'\\xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf']::BYTEA[], E'\\xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf', 'https://scallop.io', 'aave_v3'),
('navi', 'NAVI Protocol', 'lending', ARRAY[E'\\xd899cf7d2b5db716bd2cf55599fb0d5ee38a3061e7b6bb6eebf73fa5bc4c81ca']::BYTEA[], E'\\xd899cf7d2b5db716bd2cf55599fb0d5ee38a3061e7b6bb6eebf73fa5bc4c81ca', 'https://naviprotocol.io', 'compound_v3'),
('suilend', 'Suilend', 'lending', ARRAY[E'\\xf95b06141ed4a174f239417323bde3f209b972f5930d8521ea38a52aff3a6ddf']::BYTEA[], E'\\xf95b06141ed4a174f239417323bde3f209b972f5930d8521ea38a52aff3a6ddf', 'https://suilend.fi', 'aave_v3'),
('aftermath_lst', 'Aftermath (afSUI)', 'lst', ARRAY[E'\\x7f6ce7ade63857c4fd16ef7783fed2dfc4d7fb7e40615abdb653030b76aef0c6']::BYTEA[], E'\\x7f6ce7ade63857c4fd16ef7783fed2dfc4d7fb7e40615abdb653030b76aef0c6', 'https://aftermath.finance', 'lido'),
('haedal', 'Haedal (haSUI)', 'lst', ARRAY[E'\\xbde4ba4c2e274a60ce15c1cfff9e5c42e136930ee74d84b6ec3b054e2ad1c0b7']::BYTEA[], E'\\xbde4ba4c2e274a60ce15c1cfff9e5c42e136930ee74d84b6ec3b054e2ad1c0b7', 'https://haedal.xyz', 'lido'),
('volo', 'Volo (vSUI)', 'lst', ARRAY[E'\\x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55']::BYTEA[], E'\\x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55', 'https://volosui.com', 'lido');

-- Gas equivalence seed data
INSERT INTO gas_equivalence (action_category, protocol_type, eth_gas_units, eth_protocol_reference, data_source) VALUES
('swap', 'amm_v2', 150000, 'uniswap_v2', 'etherscan avg'),
('swap', 'amm_v3', 184523, 'uniswap_v3', 'etherscan avg'),
('swap', 'clob', 120000, 'dydx', 'estimate'),
('add_liquidity', 'amm_v3', 350000, 'uniswap_v3', 'etherscan avg'),
('remove_liquidity', 'amm_v3', 250000, 'uniswap_v3', 'etherscan avg'),
('lend', 'lending', 250000, 'aave_v3', 'etherscan avg'),
('borrow', 'lending', 350000, 'aave_v3', 'etherscan avg'),
('repay', 'lending', 200000, 'aave_v3', 'etherscan avg'),
('withdraw', 'lending', 200000, 'aave_v3', 'etherscan avg'),
('stake', 'lst', 150000, 'lido', 'etherscan avg'),
('unstake', 'lst', 150000, 'lido', 'etherscan avg'),
('nft_buy', 'marketplace', 200000, 'opensea', 'etherscan avg'),
('nft_sell', 'marketplace', 150000, 'opensea', 'etherscan avg'),
('transfer', 'native', 21000, 'eth_transfer', 'constant');

-- ============================================================================
-- VIEWS
-- ============================================================================

-- User yearly summary view
CREATE OR REPLACE VIEW user_yearly_summary AS
SELECT
    address,
    EXTRACT(YEAR FROM date) AS year,
    SUM(tx_count) AS total_transactions,
    SUM(command_count) AS total_commands,
    SUM(gas_spent_mist) AS total_gas_mist,
    COUNT(DISTINCT date) AS active_days,
    SUM(swap_volume_usd) AS total_swap_volume,
    SUM(swap_count) AS total_swaps,
    SUM(maker_volume_usd) AS total_maker_volume,
    SUM(taker_volume_usd) AS total_taker_volume,
    SUM(lending_supply_usd) AS total_supplied,
    SUM(lending_borrow_usd) AS total_borrowed,
    SUM(staking_amount_sui) AS total_staked,
    SUM(nft_bought_count) AS total_nfts_bought,
    SUM(nft_sold_count) AS total_nfts_sold,
    SUM(royalties_paid_usd) AS total_royalties_paid,
    MIN(min_health_factor) AS min_health_factor,
    ARRAY_AGG(DISTINCT unnest) FILTER (WHERE unnest IS NOT NULL) AS all_protocols
FROM user_metrics_daily, LATERAL unnest(protocols_used)
GROUP BY address, EXTRACT(YEAR FROM date);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate gas savings
CREATE OR REPLACE FUNCTION calculate_gas_savings(
    p_address BYTEA,
    p_year INTEGER
) RETURNS TABLE (
    total_sui_gas_mist BIGINT,
    total_sui_gas_usd NUMERIC,
    hypothetical_eth_gas_usd NUMERIC,
    savings_usd NUMERIC,
    savings_multiple NUMERIC
) AS $$
DECLARE
    v_avg_sui_price NUMERIC := 3.50;  -- Should be fetched from price_history
    v_avg_eth_price NUMERIC := 2500.00;
    v_avg_eth_gas_gwei NUMERIC := 30.0;
BEGIN
    RETURN QUERY
    WITH user_commands AS (
        SELECT
            cd.action_category,
            cd.protocol_name,
            t.gas_used
        FROM commands_decomposed cd
        JOIN transactions t ON cd.tx_digest = t.tx_digest
        WHERE t.sender = p_address
          AND EXTRACT(YEAR FROM to_timestamp(t.timestamp_ms / 1000)) = p_year
    ),
    gas_totals AS (
        SELECT
            SUM(uc.gas_used) AS sui_gas,
            SUM(COALESCE(ge.eth_gas_units, 100000)) AS eth_gas
        FROM user_commands uc
        LEFT JOIN gas_equivalence ge ON uc.action_category = ge.action_category
    )
    SELECT
        gt.sui_gas::BIGINT,
        (gt.sui_gas / 1e9 * v_avg_sui_price)::NUMERIC,
        (gt.eth_gas * v_avg_eth_gas_gwei / 1e9 * v_avg_eth_price)::NUMERIC,
        ((gt.eth_gas * v_avg_eth_gas_gwei / 1e9 * v_avg_eth_price) - (gt.sui_gas / 1e9 * v_avg_sui_price))::NUMERIC,
        CASE
            WHEN gt.sui_gas > 0 THEN
                ((gt.eth_gas * v_avg_eth_gas_gwei / 1e9 * v_avg_eth_price) / NULLIF(gt.sui_gas / 1e9 * v_avg_sui_price, 0))::NUMERIC
            ELSE 0
        END
    FROM gas_totals gt;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX idx_transactions_sender_timestamp ON transactions(sender, timestamp_ms DESC);
CREATE INDEX idx_commands_protocol_action ON commands_decomposed(protocol_name, action_category);
CREATE INDEX idx_events_protocol_action ON events_enriched(protocol_name, action_category);

-- Partial indexes for active records
CREATE INDEX idx_active_transactions ON transactions(sender, timestamp_ms)
    WHERE status = 'success';

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE checkpoints IS 'Sui blockchain checkpoint data for tracking indexer progress';
COMMENT ON TABLE transactions IS 'Individual Sui transactions with PTB metadata';
COMMENT ON TABLE commands_decomposed IS 'PTB commands broken down into individual actions';
COMMENT ON TABLE events_enriched IS 'Move events with protocol and value enrichment';
COMMENT ON TABLE object_ownership_history IS 'Historical object ownership for balance reconstruction';
COMMENT ON TABLE user_metrics_daily IS 'Pre-aggregated daily metrics per user';
COMMENT ON TABLE user_wrapped_cache IS 'Cached Sui Wrapped results';
COMMENT ON TABLE protocol_registry IS 'Registry of known Sui protocols';
COMMENT ON TABLE gas_equivalence IS 'ETH gas equivalents for savings calculation';
