exports.up = (knex) => {
  return knex.raw(`
  CREATE TABLE nextauth_accounts
  (
    id                   SERIAL,
    compound_id          VARCHAR(255) NOT NULL,
    user_id              INTEGER NOT NULL,
    provider_type        VARCHAR(255) NOT NULL,
    provider_id          VARCHAR(255) NOT NULL,
    provider_account_id  VARCHAR(255) NOT NULL,
    refresh_token        TEXT,
    access_token         TEXT,
    access_token_expires TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  );

CREATE TABLE nextauth_sessions
  (
    id            SERIAL,
    user_id       INTEGER NOT NULL,
    expires       TIMESTAMPTZ NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    access_token  VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  );

CREATE TABLE nextauth_users
  (
    id             SERIAL,
    name           VARCHAR(255),
    email          VARCHAR(255),
    email_verified TIMESTAMPTZ,
    image          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    role text,
    terms_accepted boolean,
    config jsonb,
    PRIMARY KEY (id)
  );

CREATE TABLE nextauth_verification_requests
  (
    id         SERIAL,
    identifier VARCHAR(255) NOT NULL,
    token      VARCHAR(255) NOT NULL,
    expires    TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  );

CREATE UNIQUE INDEX nextauth_compound_id
  ON nextauth_accounts(compound_id);

CREATE INDEX nextauth_provider_account_id
  ON nextauth_accounts(provider_account_id);

CREATE INDEX nextauth_provider_id
  ON nextauth_accounts(provider_id);

CREATE INDEX nextauth_user_id
  ON nextauth_accounts(user_id);

CREATE UNIQUE INDEX nextauth_session_token
  ON nextauth_sessions(session_token);

CREATE UNIQUE INDEX nextauth_access_token
  ON nextauth_sessions(access_token);

CREATE UNIQUE INDEX nextauth_email
  ON nextauth_users(email);

CREATE UNIQUE INDEX nextauth_token
  ON nextauth_verification_requests(token);
`)
}

exports.down = (knex) => {
  // not implemented
}
