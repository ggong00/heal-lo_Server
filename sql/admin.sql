drop user c##heal_lo;
--계정생성
CREATE USER c##heal_lo IDENTIFIED BY heal_lo
    DEFAULT TABLESPACE users
    TEMPORARY TABLESPACE temp
    PROFILE DEFAULT;
--권한부여
GRANT CONNECT, RESOURCE TO c##heal_lo;
GRANT CREATE VIEW, CREATE SYNONYM TO c##heal_lo;
GRANT UNLIMITED TABLESPACE TO c##heal_lo;
--락 풀기
ALTER USER c##heal_lo ACCOUNT UNLOCK;