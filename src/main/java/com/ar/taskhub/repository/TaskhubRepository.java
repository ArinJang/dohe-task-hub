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

//    public void insertTask(TaskhubDTO taskhubDTO) {
//        sql.insert("Taskhub.insertTask", taskhubDTO); //Taskhub -> mapper의 namespace 가리킴
//    }
//
//    public void insertDoDate(TaskhubDTO taskhubDTO) {
//        sql.insert("Taskhub.insertDoDate", taskhubDTO); //Taskhub -> mapper의 namespace 가리킴
//    }

    public List<TaskhubDTO> findAll(TaskhubDTO taskhubDTO) {
        return sql.selectList("Taskhub.findAll", taskhubDTO);
    }

//    public List<TaskhubDTO> findByDays(String mon, String sun) {
//        Map<String, String> monSun = new HashMap<>();
//        monSun.put("mon", mon);
//        monSun.put("sun", sun);
//        return sql.selectList("Taskhub.findByDays", monSun);
//    }

    public List<TaskhubDTO> findByDoDates(TaskhubDTO taskhubDTO) {
        return sql.selectList("Taskhub.findByDoDates", taskhubDTO);
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

    public void updateStatus(String id, String status) {
        Map<String, String> idStatus = new HashMap<>();
        idStatus.put("task_id", id);
        idStatus.put("task_status", status);
        sql.update("Taskhub.updateStatus", idStatus);
    }

    public void deleteTask(String taskId) {
        sql.delete("Taskhub.deleteTask", taskId);
    }

    public void deleteDoDatesByTaskId(String taskId) {
        sql.delete("Taskhub.deleteDoDatesByTaskId", taskId);
    }

    public List<TaskhubDTO> getCategories() {
        return sql.selectList("Taskhub.getCategories");
    }

    public List<TaskhubDTO> findByStatus(TaskhubDTO taskhubDTO) {
        return sql.selectList("Taskhub.findByStatus", taskhubDTO);
    }

//    public void updateOrderAndDoDate0(TaskhubDTO taskhubDTO) {
//        sql.update("Taskhub.updateOrderAndDoDate0", taskhubDTO);
//    }

    public void updateOrderAndDoDateInDifferentDate1(TaskhubDTO taskhubDTO) {
        sql.update("Taskhub.updateOrderAndDoDateInDifferentDate1", taskhubDTO);
    }

    public void updateOrderAndDoDateInDifferentDate2(TaskhubDTO taskhubDTO) {
        sql.update("Taskhub.updateOrderAndDoDateInDifferentDate2", taskhubDTO);
    }

    public void updateOrderAndDoDateOfTask(TaskhubDTO taskhubDTO) {
        sql.update("Taskhub.updateOrderAndDoDateOfTask", taskhubDTO);
    }

    public void updateOrderAndDoDateInSameDateDown(TaskhubDTO taskhubDTO) {
        sql.update("Taskhub.updateOrderAndDoDateInSameDateDown", taskhubDTO);
    }

    public void updateOrderAndDoDateInSameDateUp(TaskhubDTO taskhubDTO) {
        sql.update("Taskhub.updateOrderAndDoDateInSameDateUp", taskhubDTO);
    }

    public void callInsertTaskAndDoDates(Map<String, Object> params) {
        sql.selectOne("Taskhub.callInsertTaskAndDoDates", params);
    }

    public int getMaxTaskOrder(String doDate) {
        return sql.selectOne("Taskhub.getMaxTaskOrder", doDate);
    }

    public void insertDoDate(String taskId, String doDate, int taskOrder) {
        Map<String, Object> params = new HashMap<>();
        params.put("taskId", taskId);
        params.put("doDate", doDate);
        params.put("taskOrder", taskOrder);
//        System.out.println("Repository doDate:"+doDate);

        sql.insert("Taskhub.insertDoDate", params);
    }

    public void assignOtherOrder(String taskId) {
        sql.update("Taskhub.assignOtherOrder", taskId);
    }
    public void rearrangeOrder(String taskId) {
        sql.update("Taskhub.rearrangeOrder", taskId);
    }

    public Map<String, Object> getOldDoDateAndOrder(String taskId) {
        return sql.selectOne("Taskhub.getOldDoDateAndOrder", taskId);
    }

    public String getMaxIdxOfNewDate(String newDoDate) {
        return sql.selectOne("Taskhub.getMaxIdxOfNewDate", newDoDate);
    }
}
