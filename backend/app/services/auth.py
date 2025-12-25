from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MAX_PASSWORD_LEN = 72  # bcrypt limit


def hash_password(password: str) -> str:
    password = password[:MAX_PASSWORD_LEN]
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    password = password[:MAX_PASSWORD_LEN]
    return pwd_context.verify(password, password_hash)
