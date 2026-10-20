"""create accounts table"""

from alembic import op
import sqlalchemy as sa

revision = "0002_create_accounts"
down_revision = "0001_create_posts"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "accounts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=64), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )
    op.create_index("ix_accounts_username", "accounts", ["username"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_accounts_username", table_name="accounts")
    op.drop_table("accounts")
