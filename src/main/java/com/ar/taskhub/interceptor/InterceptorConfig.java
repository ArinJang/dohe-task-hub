//package com.ar.taskhub.interceptor;
//
//import jakarta.servlet.http.HttpSession;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//@Configuration
//public class InterceptorConfig {
//
//    private final HttpSession session;
//
//    public InterceptorConfig(HttpSession session) {
//        this.session = session;
//    }
//
//    @Bean
//    public UserSessionInterceptor userSessionInterceptor() {
//        return new UserSessionInterceptor(session);
//    }
//}
