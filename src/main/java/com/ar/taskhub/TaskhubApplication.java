package com.ar.taskhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan("com.ar.taskhub.entity") // 실제 패키지 경로로 수정
//@EntityScan(basePackages = {"com.ar.taskhub.entity"})
public class TaskhubApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaskhubApplication.class, args);
	}

}
