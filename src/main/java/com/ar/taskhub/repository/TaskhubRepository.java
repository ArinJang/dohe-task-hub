package com.ar.taskhub.repository;

import com.ar.taskhub.dto.TaskhubDTO;
import lombok.RequiredArgsConstructor;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
//@Repository("taskhubRepository")  // 명시적으로 Bean 이름 지정
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

    public List<TaskhubDTO> findAll(Long user_id) {
        return sql.selectList("Taskhub.findAll", user_id);
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

    public List<TaskhubDTO> findByWork(Long user_id) {
        return sql.selectList("Taskhub.findByWork", user_id);
    }

    public List<TaskhubDTO> findWorks(Long user_id) {
        return sql.selectList("Taskhub.findWorks", user_id);
    }

    public TaskhubDTO findById(String taskId) {
        return sql.selectOne("Taskhub.findById", taskId);
    }

    public int findNewId(Long user_id) {
        return sql.selectOne("Taskhub.findNewId", user_id);
    }

    public void updateTask(TaskhubDTO taskhubDTO) {
        sql.update("Taskhub.updateTask", taskhubDTO);
    }
    public void updateTaskDeletingWorkId(Long work_id) {
        sql.update("Taskhub.updateTaskDeletingWorkId", work_id);
    }

    public void updateWork(TaskhubDTO taskhubDTO) {
        sql.update("Taskhub.updateWork", taskhubDTO);
    }

    public void updateStatus(Map<String, Object> params) {
        sql.update("Taskhub.updateStatus", params);
    }

    public void deleteTask(String taskId) {
        sql.delete("Taskhub.deleteTask", taskId);
    }

    public void deleteWork(Map<String, Object> params) {
        sql.delete("Taskhub.deleteWork", params);
    }

    public void deleteDoDatesByTaskId(String taskId) {
        sql.delete("Taskhub.deleteDoDatesByTaskId", taskId);
    }

    public List<TaskhubDTO> getCategories(Long user_id) {
        return sql.selectList("Taskhub.getCategories", user_id);
    }

    public List<TaskhubDTO> findByStatus(Map<String, Object> params) {
        return sql.selectList("Taskhub.findByStatus", params);
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

    public void callInsertTaskAndDoDates(TaskhubDTO taskhubDTO) {
        sql.selectOne("Taskhub.callInsertTaskAndDoDates", taskhubDTO);
    }

    public void insertWork(TaskhubDTO taskhubDTO) {
        sql.insert("Taskhub.insertWork", taskhubDTO);
    }

    public int getMaxTaskOrder(Map<String, Object> params) {
        return sql.selectOne("Taskhub.getMaxTaskOrder", params);
    }

    public void insertDoDate(Map<String, Object> params) {
        sql.insert("Taskhub.insertDoDate", params);
    }

    public void assignOtherOrder(String taskId) {
        sql.update("Taskhub.assignOtherOrder", taskId);
    }
    public void rearrangeOrder(Map<String, Object> params) {
        sql.update("Taskhub.rearrangeOrder", params);
    }

    public Map<String, Object> getOldDoDateAndOrder(String taskId) {
        return sql.selectOne("Taskhub.getOldDoDateAndOrder", taskId);
    }

    public String getMaxIdxOfNewDate(Map<String, Object> params) {
        return sql.selectOne("Taskhub.getMaxIdxOfNewDate", params);
    }

}
