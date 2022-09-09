-- 회원
create table member (
    memno          number(8),
    memid          varchar2(40),
    mempw          varchar2(20),
    memtel         varchar2(13),
    memninkname    varchar2(30),
    mememail       varchar2(30),
    memname        varchar2(12),
    memcode        varchar2(15),
    memcdate       date,
    memudate       date
);

-- 제약조건
alter table member add constraint member_memno_pk primary key (memno);
alter table member modify memid constraint member_memid_nn NOT NULL;
alter table member modify mempw constraint member_mempw_nn NOT NULL;
alter table member modify memtel constraint member_memtel_nn NOT NULL;
alter table member modify memninkname constraint member_memninkname_nn NOT NULL;
alter table member modify mememail constraint member_mememail_nn NOT NULL;
alter table member modify memname constraint member_memname_nn NOT NULL;
alter table member modify memcdate constraint member_memcdate_nn NOT NULL;
alter table member modify memudate constraint member_memudate_nn NOT NULL;
alter table member add constraint memid_uk unique (memid);
alter table member add constraint memtel_uk unique (memtel);
alter table member add constraint memninkname_uk unique (memninkname);
alter table member add constraint mememail_uk unique (mememail);


-- 회원 시퀀스
create sequence member_memno_seq;