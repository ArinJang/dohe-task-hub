//package com.ar.taskhub.interceptor;
//import com.ar.taskhub.dto.TaskhubDTO;
//import org.apache.ibatis.executor.Executor;
//import org.apache.ibatis.mapping.MappedStatement;
//import org.apache.ibatis.plugin.*;
//import org.apache.ibatis.session.ResultHandler;
//import org.apache.ibatis.session.RowBounds;
//import jakarta.servlet.http.HttpSession;
//
//import java.util.Map;
//import java.util.Properties;
//
//@Intercepts({
//        @Signature(type = Executor.class, method = "query", args = {
//                MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class
//        })
//})
//public class UserSessionInterceptor implements Interceptor {
//
//    private final HttpSession session;
//
//    public UserSessionInterceptor(HttpSession session) {
//        this.session = session;
//    }
//
//    @Override
//    public Object intercept(Invocation invocation) throws Throwable {
//        Object parameter = invocation.getArgs()[1]; // 파라미터 객체 가져오기
//        Long userId = (Long) session.getAttribute("loginUserId");
//
//        // Map이나 DTO에 userId 자동 설정
//        if (parameter instanceof TaskhubDTO) {
//            ((TaskhubDTO) parameter).setUser_id(userId);
//        } else if (parameter instanceof Map) {
//            ((Map<String, Object>) parameter).put("user_id", userId);
//        }
//
//        return invocation.proceed();
//    }
//
//    @Override
//    public Object plugin(Object target) {
//        return Plugin.wrap(target, this);
//    }
//
//    @Override
//    public void setProperties(Properties properties) {
//        // 추가 설정 필요 시
//    }
//}
