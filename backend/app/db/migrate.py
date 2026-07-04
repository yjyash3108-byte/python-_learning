from sqlalchemy import text



from app.db.session import engine





def run_migrations() -> None:

    """Apply lightweight schema updates for existing databases."""

    statements = [

        "ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE",

        "ALTER TABLE users ADD COLUMN IF NOT EXISTS career_goals TEXT DEFAULT ''",

        "ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(40)",

        "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users (username)",

        """

        UPDATE users

        SET onboarding_completed = TRUE

        WHERE onboarding_completed = FALSE

          AND (

            COALESCE(bio, '') <> ''

            OR profile_picture_url IS NOT NULL

            OR COALESCE(array_length(skills, 1), 0) > 0

            OR COALESCE(array_length(interests, 1), 0) > 0

          )

        """,

        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS link_url VARCHAR(500)",

        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}'",

        "ALTER TABLE club_members ALTER COLUMN role TYPE VARCHAR(30)",

        """

        CREATE TABLE IF NOT EXISTS password_reset_tokens (

            id UUID PRIMARY KEY,

            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

            token_hash VARCHAR(64) NOT NULL,

            expires_at TIMESTAMPTZ NOT NULL,

            used_at TIMESTAMPTZ,

            created_at TIMESTAMPTZ DEFAULT NOW()

        )

        """,

        "CREATE INDEX IF NOT EXISTS ix_password_reset_tokens_user_id ON password_reset_tokens (user_id)",

        "CREATE INDEX IF NOT EXISTS ix_password_reset_tokens_token_hash ON password_reset_tokens (token_hash)",

        """

        CREATE TABLE IF NOT EXISTS email_verification_tokens (

            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

            token_hash VARCHAR(64) NOT NULL,

            expires_at TIMESTAMPTZ NOT NULL,

            used_at TIMESTAMPTZ,

            created_at TIMESTAMPTZ DEFAULT NOW()

        )

        """,

        """

        CREATE TABLE IF NOT EXISTS reports (

            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

            reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

            target_type VARCHAR(30) NOT NULL,

            target_id VARCHAR(100) NOT NULL,

            reason VARCHAR(500) NOT NULL,

            details TEXT DEFAULT '',

            status VARCHAR(20) DEFAULT 'pending',

            created_at TIMESTAMPTZ DEFAULT NOW()

        )

        """,

        """

        CREATE TABLE IF NOT EXISTS blocked_users (

            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

            blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

            blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

            created_at TIMESTAMPTZ DEFAULT NOW(),

            UNIQUE (blocker_id, blocked_id)

        )

        """,

        """

        CREATE TABLE IF NOT EXISTS profile_views (

            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

            profile_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

            viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,

            created_at TIMESTAMPTZ DEFAULT NOW()

        )

        """,

        """

        CREATE TABLE IF NOT EXISTS post_views (

            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

            post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,

            viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,

            created_at TIMESTAMPTZ DEFAULT NOW()

        )

        """,

        """

        CREATE TABLE IF NOT EXISTS verified_schools (

            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

            school_name VARCHAR(120) UNIQUE NOT NULL,

            slug VARCHAR(140) UNIQUE NOT NULL,

            city VARCHAR(120),

            is_verified BOOLEAN DEFAULT FALSE,

            created_at TIMESTAMPTZ DEFAULT NOW()

        )

        """,

        "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE",

        "UPDATE users SET email_verified = TRUE WHERE email_verified = FALSE AND is_verified = TRUE",

    ]

    with engine.begin() as conn:

        for stmt in statements:

            conn.execute(text(stmt))

