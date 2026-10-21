"""add expiring share links for posts and boards"""

from alembic import op
import sqlalchemy as sa

revision = "0003_add_sharing"
down_revision = "0002_create_accounts"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("posts", sa.Column("share_token", sa.String(length=128), nullable=True))
    op.add_column("posts", sa.Column("share_expires_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index("ix_posts_share_token", "posts", ["share_token"], unique=True)

    op.add_column("accounts", sa.Column("board_share_token", sa.String(length=128), nullable=True))
    op.add_column("accounts", sa.Column("board_share_expires_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index("ix_accounts_board_share_token", "accounts", ["board_share_token"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_accounts_board_share_token", table_name="accounts")
    op.drop_column("accounts", "board_share_expires_at")
    op.drop_column("accounts", "board_share_token")
    op.drop_index("ix_posts_share_token", table_name="posts")
    op.drop_column("posts", "share_expires_at")
    op.drop_column("posts", "share_token")
