package com.kh.heallo.domain.member.dao;

import com.kh.heallo.domain.board.Board;
import com.kh.heallo.domain.member.Member;
import com.kh.heallo.domain.review.Review;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;

@Slf4j
@Repository
@RequiredArgsConstructor
public class MemberDAOImpl implements  MemberDAO{

  private final JdbcTemplate jdbcTemplate;

  /**
   * 가입
   *
   * @param member 가입정보
   * @return 가입건수
   */
  @Override
  public Long join(Member member) {
    StringBuffer sql = new StringBuffer();
    sql.append(" insert into member ");
    sql.append(" values (member_memno_seq.nextval ,? ,? ,? ,? ,? ,? ,'normal' ,sysdate ,sysdate ) ");

    KeyHolder keyHolder = new GeneratedKeyHolder();

    jdbcTemplate.update(con -> {
      PreparedStatement preparedStatement = con.prepareStatement(sql.toString(), new String[]{"memno"});
      preparedStatement.setString(1, member.getMemid());
      preparedStatement.setString(2, member.getMempw());
      preparedStatement.setString(3, member.getMemtel());
      preparedStatement.setString(4, member.getMemnickname());
      preparedStatement.setString(5, member.getMememail());
      preparedStatement.setString(6, member.getMemname());

      return preparedStatement;
    }, keyHolder);

    Long memno = Long.valueOf(keyHolder.getKeys().get("memno").toString());

    member.setMemno(memno);
    return memno;
  }

  /**
   * 조회 BY 회원번호
   * @param memno 회원번호
   * @return  회원정보
   */
  @Override
  public Member findById(Long memno) {
    StringBuffer sql = new StringBuffer();

    sql.append("select * ");
    sql.append("  from member ");
    sql.append(" where memno= ? ");

    Member findedMember = null;
    try{
      findedMember = jdbcTemplate.queryForObject(sql.toString(), new BeanPropertyRowMapper<>(Member.class), memno);
    }catch (DataAccessException e) {
      log.info("찾고자하는 회원이 없습니다={}", memno);
    }
    return findedMember;
  }

  /**
   * 수정
   * @param memno  아이디
   * @param member 수정할 정보
   * @return  수정건수
   */
  @Override
  public void update(Long memno, Member member) {
    StringBuffer sql = new StringBuffer();

    log.info("memno={}",memno);
    log.info("member={}",member);

    sql.append(" update member ");
    sql.append("   set memname = ?, ");
    sql.append("       memnickname = ?, ");
    sql.append("       mememail = ?, ");
    sql.append("       mempw = ?, ");
    sql.append("       memtel = ?, ");
    sql.append("       memudate = sysdate ");
    sql.append(" where memno = ? ");

    jdbcTemplate.update(sql.toString(), member.getMemname(), member.getMemnickname(),
            member.getMememail(), member.getMempw(), member.getMemtel(), memno);
  }

  /**
   * 탈퇴
   * @param memid
   * @return
   */
  @Override
  public void del(String memid) {
    String sql = "delete MEMBER where memid= ? ";

    jdbcTemplate.update(sql, memid);
  }

  /**
   * 로그인
   * @param memid 아이디
   * @param mempw 비밀번호
   * @return  회원
   */
  @Override
  public Optional<Member> login(String memid, String mempw) {
    StringBuffer sql = new StringBuffer();
    sql.append(" select * ");
    sql.append("  from member ");
    sql.append(" where memid = ? ");
    sql.append("   and mempw = ? ");

    try {
      Member member = jdbcTemplate.queryForObject(
              sql.toString(),
              new BeanPropertyRowMapper<>(Member.class),
              memid,mempw
      );

      return Optional.of(member);
    } catch (DataAccessException e) {
      e.printStackTrace();
      return Optional.empty();
    }
  }

  /**
   * 아이디 찾기
   *
   * @param memname  이름
   * @param mememail 이메일
   * @return 아이디
   */
  @Override
  public Member findId(String memname, String mememail) {
    StringBuffer sql = new StringBuffer();

    log.info(memname);
    log.info(mememail);

    sql.append(" select memid ");
    sql.append("  from member ");
    sql.append(" where memname = ? ");
    sql.append("   and mememail = ? ");

    Member findId = null;
    try{
      findId = jdbcTemplate.queryForObject(sql.toString(), new BeanPropertyRowMapper<>(Member.class), memname, mememail);
    }catch (DataAccessException e) {
      log.info("찾고자하는 회원이 없습니다={}", memname,mememail);
    }
    return findId;

  }

  /**
   * 비밀번호 찾기
   *
   * @param memid    아이디
   * @param memname  이름
   * @param mememail 이메일
   * @return
   */
  @Override
  public Member findPw(String memid, String memname, String mememail) {
    StringBuffer sql = new StringBuffer();

    log.info(memid);
    log.info(memname);
    log.info(mememail);

    sql.append(" select mempw ");
    sql.append("  from member ");
    sql.append(" where memid = ? ");
    sql.append("   and memname = ? ");
    sql.append("   and mememail = ? ");

    Member findPw = null;
    try{
      findPw = jdbcTemplate.queryForObject(sql.toString(), new BeanPropertyRowMapper<>(Member.class),memid, memname, mememail);
    }catch (DataAccessException e) {
      log.info("찾고자하는 회원이 없습니다={}",memid, memname,mememail);
    }
    return findPw;
  }

  /**
   * 로그인 계정 작성 게시글 조회
   *
   * @param memno 회원번호
   * @return
   */
  @Override
  public List<Board> findBoardByMemno(Long memno) {
    StringBuffer sql = new StringBuffer();

    sql.append(" select board.BDNO bdno, board.BDTITLE bdtitle, board.BDCDATE bdcdate, board.BDVIEW bdview ");
    sql.append("   from member, board ");
    sql.append("  where member.MEMNO = board.MEMNO ");

    List<Board> boards = jdbcTemplate.query(sql.toString(), new BeanPropertyRowMapper<>(Board.class));

    return boards;
  }

  /**
   * 로그인 계정 작성 리뷰 조회
   * @param memno   회원번호
   * @param rvno    리뷰번호
   * @return        리뷰내용
   */
  @Override
  public List<Review> findReviewByMemno(Long memno, Long rvno) {
    StringBuffer sql = new StringBuffer();

    sql.append(" select  member.MEMNO memno, review.RVNO rvno, review.RVCONTENTS rvcontents, review.RVCDATE rvcdate, review.RVSCORE  rvscore ");
    sql.append("   from  member, review ");
    sql.append("  where  member.MEMNO = review.MEMNO ");

    List<Review> reviews = jdbcTemplate.query(sql.toString(), new BeanPropertyRowMapper<>(Review.class));

    return reviews;
  }
}
