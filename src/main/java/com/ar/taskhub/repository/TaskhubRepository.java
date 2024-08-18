package com.ar.taskhub.repository;

import com.ar.taskhub.dto.TaskhubDTO;
import io.micrometer.observation.ObservationFilter;
import lombok.RequiredArgsConstructor;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class TaskhubRepository {

    private final SqlSessionTemplate sql;
    public void save(TaskhubDTO taskhubDTO) {
        sql.insert("Taskhub.save", taskhubDTO); //Taskhub -> mapper의 namespace 가리킴
    }

    public List<TaskhubDTO> findAll() {
        return sql.selectList("Taskhub.findAll");
    }

    public List<TaskhubDTO> findByDays(String mon, String sun) {
        Map<String, String> monSun = new HashMap<>();
        monSun.put("mon", mon);
        monSun.put("sun", sun);
        return sql.selectList("Taskhub.findByDays", monSun);
    }

    public List<TaskhubDTO> findByDoDates(String mon, String sun) {
        Map<String, String> monSun = new HashMap<>();
        monSun.put("mon", mon);
        monSun.put("sun", sun);
        return sql.selectList("Taskhub.findByDoDates", monSun);
    }

    public TaskhubDTO findById(String taskId) {
        return sql.selectOne("Taskhub.findById", taskId);
    }

    public int findNewId() {
        return sql.selectOne("Taskhub.findNewId");
    }

    public void updateTask(TaskhubDTO taskhubDTO) {
        sql.update("Taskhub.updateTask", taskhubDTO);
    }

    public void deleteTask(String taskId) {
        sql.delete("Taskhub.deleteTask", taskId);
    }

    public List<TaskhubDTO> getCategories() {
        return sql.selectList("Taskhub.getCategories");
    }
}
