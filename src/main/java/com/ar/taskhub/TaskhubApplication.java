package com.ar.taskhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling // 스케줄러 활성화
@EntityScan("com.ar.taskhub.entity") // 실제 패키지 경로로 수정
//@EntityScan(basePackages = {"com.ar.taskhub.entity"})
public class TaskhubApplication {

	public static void main(String[] args) {
		TimeZone.setDefault(TimeZone.getTimeZone("Europe/London"));	// EC2에서도 Tomcat 서버의 시간을 런던 시간으로 변경한다.
		SpringApplication.run(TaskhubApplication.class, args);
	}

}
