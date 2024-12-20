package com.ar.taskhub.repository;

import com.ar.taskhub.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;

import java.util.Optional;

//@Repository("userRepositoryJpa")
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    // 이메일로 회원 정보 조회 (select * from user where userId=?)
    Optional<UserEntity> findByUserName(String userName);
}
