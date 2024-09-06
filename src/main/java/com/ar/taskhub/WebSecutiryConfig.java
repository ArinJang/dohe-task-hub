//package com.ar.taskhub;
//
//import lombok.RequiredArgsConstructor;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.builders.WebSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.web.SecurityFilterChain;
//
//import static org.springframework.security.config.Customizer.withDefaults;
//
//@Configuration
//@EnableWebSecurity
//@RequiredArgsConstructor
//public class WebSecurityConfig { // 정적 자원에 대해서는 Security 설정을 적용하지 않음.
//
//
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//                .authorizeHttpRequests((authz) -> authz
//                        .anyRequest().authenticated()
//                )
//                .httpBasic(withDefaults());
//        return http.build();
//    }
//    private final UserDetailsService userDetailsService;
//
//    public void configure(WebSecurity web) {
//        web
//                .ignoring() // spring security 필터 타지 않도록 설정
//                .antMatchers("/resources/**") // 정적 리소스 무시
//                .antMatchers("/h2-console/**"); // h2-console 무시
//    }
//
//    protected void configure(HttpSecurity http) throws Exception {
//        // 1. URL 별 권한 설정
//        // 2. login, logout url 과 성공했을 때, 실패했을 때 설정
//        http.csrf().disable().authorizeRequests()
//                .antMatchers("/login", "/signup").permitAll()   // /login, /signup 은 인증 안해도 접근 가능하도록 설정
//                .antMatchers("/admin").hasRole("ADMIN")         // /admin 은 어드민 유저만 가능하도록 설정
//                .antMatchers("/my").authenticated()             // /my 은 인증이 되야함
//                .and()
//                .formLogin()                                    // form 을 통한 login 활성화
//                .loginPage("/login")                            // 로그인 페이지 URL 설정 , 설정하지 않는 경우 default 로그인 페이지 노출
//                .successHandler(customLoginSuccessHandler())
//                .failureForwardUrl("/fail")                     // 로그인 실패 URL 설정
//                .and()
//                .logout()
//                .logoutUrl("/logout")                           // 로그아웃 URL 설정
//    }
//
//    @Bean
//    public BCryptPasswordEncoder bCryptPasswordEncoder() {
//        // 비밀번호 암호화 할때 사용할 BCrypthPasswordEncoder 를 빈으로 등록
//        return new BCryptPasswordEncoder();
//    }
//
//
//    @Bean
//    public CustomLoginSuccessHandler customLoginSuccessHandler() {
//        // 성공할 때 실행되어야 하는 CustomLoginSuccessHandler 를 빈으로 등록
//        return new CustomLoginSuccessHandler();
//    }
//
//    @Bean
//    public CustomAuthenticationProvider customAuthenticationProvider() {
//        // 실제 인증 당담 객체를 빈으로 등록
//        return new CustomAuthenticationProvider(userDetailsService, bCryptPasswordEncoder());
//    }
//
//    @Override
//    public void configure(AuthenticationManagerBuilder authenticationManagerBuilder) {
//        // 커스텀한 AuthenticationProvider 를 AuthenticationManager 에 등록
//        authenticationManagerBuilder.authenticationProvider(customAuthenticationProvider());
//    }
//}