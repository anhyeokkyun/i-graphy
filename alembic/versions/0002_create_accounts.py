"""create accounts table and assign posts to accounts"""

from alembic import op
import sqlalchemy as sa

revision = "0002_create_accounts"
down_revision = "0001_create_posts"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "accounts",
        sa.Column("id", sa.Integer(), sa.Identity(), nullable=False),
        sa.Column("username", sa.String(length=64), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )
    op.create_index("ix_accounts_username", "accounts", ["username"], unique=False)
    op.add_column("posts", sa.Column("owner_id", sa.Integer(), nullable=True))
    op.create_foreign_key("fk_posts_owner_id_accounts", "posts", "accounts", ["owner_id"], ["id"])
    op.create_index("ix_posts_owner_id", "posts", ["owner_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_posts_owner_id", table_name="posts")
    op.drop_constraint("fk_posts_owner_id_accounts", "posts", type_="foreignkey")
    op.drop_column("posts", "owner_id")
    op.drop_index("ix_accounts_username", table_name="accounts")
    op.drop_table("accounts")
