package com.ar.taskhub.repository;

import com.ar.taskhub.dto.TaskhubDTO;
import lombok.RequiredArgsConstructor;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

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

    public List<TaskhubDTO> findAll(Long user_id) {
        return sql.selectList("Taskhub.findAll", user_id);
    }

    public List<TaskhubDTO> findAssignedToMe(Long user_id) {
        return sql.selectList("Taskhub.findAssignedToMe", user_id);
    }

    public TaskhubDTO findTaskContent(Long task_id) {
        return sql.selectOne("Taskhub.findTaskContent", task_id);
    }

    public List<TaskhubDTO> findByDoDates(TaskhubDTO taskhubDTO) {
        return sql.selectList("Taskhub.findByDoDates", taskhubDTO);
    }

    public List<TaskhubDTO> findByCategory(String categoryId) {
        return sql.selectList("Taskhub.findByCategory", categoryId);
    }

    public List<TaskhubDTO> findByWork(Map<String, Object> params) {
        return sql.selectList("Taskhub.findByWork", params);
    }

    public List<TaskhubDTO> findCompletedTasksByWork(Long user_id) {
        return sql.selectList("Taskhub.findCompletedTasksByWork", user_id);
    }

    public List<TaskhubDTO> findWorks(Map<String, Object> params) {
        return sql.selectList("Taskhub.findWorks", params);
    }

    public List<TaskhubDTO> findGroups(Long user_id) {
        return sql.selectList("Taskhub.findGroups", user_id);
    }

    public List<TaskhubDTO> findUsers(Long user_id) {
        return sql.selectList("Taskhub.findUsers", user_id);
    }

    public TaskhubDTO findById(Map<String, Object> params) {
        return sql.selectOne("Taskhub.findById", params);
    }

    public TaskhubDTO findWorkById(Long work_id) {
        return sql.selectOne("Taskhub.findWorkById", work_id);
    }

    public TaskhubDTO findRoutineById(Long routine_id) {
        return sql.selectOne("Taskhub.findRoutineById", routine_id);
    }

    public String findLatestDoDateById(Long task_id) {
        return sql.selectOne("Taskhub.findLatestDoDateById", task_id);
    }

    public int findNewId(Long user_id) {
        return sql.selectOne("Taskhub.findNewId", user_id);
    }

    public void updateTask(TaskhubDTO taskhubDTO) {
        sql.update("Taskhub.updateTask", taskhubDTO);
    }

    public void updateDoDateTaskDone(Map<String, Object> params) {
        sql.update("Taskhub.updateDoDateTaskDone", params);
    }

    public void updateTaskDeletingWorkId(Long work_id) {
        sql.update("Taskhub.updateTaskDeletingWorkId", work_id);
    }

    public void updateWork(TaskhubDTO taskhubDTO) {
        sql.update("Taskhub.updateWork", taskhubDTO);
    }

    public void updateRoutine(TaskhubDTO taskhubDTO) {
        sql.update("Taskhub.updateRoutine", taskhubDTO);
    }

    public void updateCategory(TaskhubDTO taskhubDTO) {
        sql.update("Taskhub.updateCategory", taskhubDTO);
    }

    public void clearParent(Long task_id) {
        sql.update("Taskhub.clearParent", task_id);
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

    public void deleteRoutine(Map<String, Object> params) {
        sql.delete("Taskhub.deleteRoutine", params);
    }

    public void deleteCategory(Map<String, Object> params) {
        sql.delete("Taskhub.deleteCategory", params);
    }

    public void deleteDoDatesByTaskId(String taskId) {
        sql.delete("Taskhub.deleteDoDatesByTaskId", taskId);
    }

    public void deleteDoDatesByTaskId2(Map<String, Object> params) {
        sql.delete("Taskhub.deleteDoDatesByTaskId2", params);
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

    public void orderMinus1BeforeDeletion(TaskhubDTO taskhubDTO) {
        sql.update("Taskhub.orderMinus1BeforeDeletion", taskhubDTO);
    }

    public void orderPlus1BeforeInsertion(TaskhubDTO taskhubDTO) {
        System.out.println("orderPlus1BeforeInsertion "+taskhubDTO);
        sql.update("Taskhub.orderPlus1BeforeInsertion", taskhubDTO);
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

    public void insertCategory(TaskhubDTO taskhubDTO) {
        sql.insert("Taskhub.insertCategory", taskhubDTO);
    }


    public void insertRoutine(TaskhubDTO taskhubDTO) {
        sql.insert("Taskhub.insertRoutine", taskhubDTO);
    }
    public int getMaxTaskOrder(Map<String, Object> params) {
        return sql.selectOne("Taskhub.getMaxTaskOrder", params);
    }

    public void insertDoDate(Map<String, Object> params) {
        System.out.println("insertDoDate: "+params);
        sql.insert("Taskhub.insertDoDate", params);
    }

    public void assignTempOrderById(String taskId) {
        sql.update("Taskhub.assignTempOrderById", taskId);
    }

    public void assignTempOrderByIdDate(Map<String, Object> params) {
        sql.update("Taskhub.assignTempOrderByIdDate", params);
    }
    public void rearrangeOrderById(Map<String, Object> params) {
        sql.update("Taskhub.rearrangeOrderById", params);
    }
    public void rearrangeOrderByIdDate(Map<String, Object> params) {
        sql.update("Taskhub.rearrangeOrderByIdDate", params);
    }

    public Map<String, Object> getOldDoDateAndOrder(String taskId) {
        return sql.selectOne("Taskhub.getOldDoDateAndOrder", taskId);
    }

    public String getMaxIdxOfNewDate(Map<String, Object> params) {
        return sql.selectOne("Taskhub.getMaxIdxOfNewDate", params);
    }

    public List<Long> findAllUsers() {
        return sql.selectList("Taskhub.findAllUsers");
    }

    public List<TaskhubDTO> findUncompletedUndone(Long user_id) {
        return sql.selectList("Taskhub.findUncompletedUndone", user_id);
    }

    public List<String> findUncompletedDone(Long user_id) {
        return sql.selectList("Taskhub.findUncompletedDone", user_id);
    }

    // 오늘 작업을 이미 실행했는지 확인
    public boolean isTaskExecutedToday(String today) {
        return sql.selectOne("Taskhub.isTaskExecutedToday", today);
    }

    // 작업 실행 로그 저장
    public void saveExecutionLog(String today) {
        sql.insert("Taskhub.saveExecutionLog", today);
    }

    public int isDuplicateOnSameDate(Map<String, Object> params) {
        return sql.selectOne("Taskhub.isDuplicateOnSameDate", params);
    }

    public int isOnlyDoDate(String taskId) {
        return sql.selectOne("Taskhub.isOnlyDoDate", taskId);
    }

    public void updateDetailDoDate(Map<String, Object> params) {
        sql.update("Taskhub.updateDetailDoDate", params);
    }

    public String isDone(Map<String, Object> params) {
        return sql.selectOne("Taskhub.isDone", params);
    }

    public int isEveryTaskCompleted(Long workId) {
        return sql.selectOne("Taskhub.isEveryTaskCompleted", workId);
    }

    public List<Long> findSubTasks(String taskId) {
        return sql.selectList("Taskhub.findSubTasks", taskId);
    }
    public List<Long> findTasksUnderWork(Long workId) {
        return sql.selectList("Taskhub.findTasksUnderWork", workId);
    }

    public Long findFirstGroup(Long user_id) {
        return sql.selectOne("Taskhub.findFirstGroup", user_id);
    }

    public List<TaskhubDTO> findRoutines(Long user_id) {
        return sql.selectList("Taskhub.findRoutines", user_id);
    }

    public int isRoutineInGroup(Long routineId) {
        return sql.selectOne("Taskhub.isRoutineInGroup", routineId);
    }

    public Map<String, Object> getRoutineCycleAndDay(Long routineId) {
        return sql.selectOne("Taskhub.getRoutineCycleAndDay", routineId);
    }
}