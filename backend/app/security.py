import base64
import hashlib
import hmac
import os
import secrets

ITERATIONS = 310_000


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, ITERATIONS)
    salt_text = base64.urlsafe_b64encode(salt).decode("ascii")
    digest_text = base64.urlsafe_b64encode(digest).decode("ascii")
    return "pbkdf2_sha256$" + str(ITERATIONS) + "$" + salt_text + "$" + digest_text


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, rounds, salt_text, digest_text = stored_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        salt = base64.urlsafe_b64decode(salt_text.encode("ascii"))
        expected = base64.urlsafe_b64decode(digest_text.encode("ascii"))
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(rounds))
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def session_secret() -> str:
    # 배포 환경에서는 반드시 고정된 SESSION_SECRET을 설정한다.
    return os.getenv("SESSION_SECRET") or secrets.token_urlsafe(32)
