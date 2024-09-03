package com.ar.taskhub.service;

import com.ar.taskhub.dto.TaskhubDTO;
import com.ar.taskhub.repository.TaskhubRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TaskhubService {
    private final TaskhubRepository taskhubRepository;

//    public void save(TaskhubDTO taskhubDTO) {
//        if(taskhubDTO.getDo_dates() != null) {
//            taskhubDTO.setDo_dates("9999-12-31");
//        }
//        taskhubRepository.insertTask(taskhubDTO);
//        taskhubRepository.insertDoDate(taskhubDTO);
//    }

    @Transactional
    public void save(TaskhubDTO taskhubDTO) {
        if(taskhubDTO.getDo_dates() == null || taskhubDTO.getDo_dates().equals("")) {
            taskhubDTO.setDo_dates("9999-12-31");
        }
        Map<String, Object> params = new HashMap<>();
        params.put("task_content", taskhubDTO.getTask_content());
        params.put("do_dates", taskhubDTO.getDo_dates());
        params.put("task_order", 1);
        params.put("user_id", "Terry");

        taskhubRepository.callInsertTaskAndDoDates(params);
    }

    public List<TaskhubDTO> findAll(){
        return taskhubRepository.findAll();
    }

//    public List<TaskhubDTO> findByDays(String mon, String sun) {
////        List<TaskhubDTO> dto = taskhubRepository.findByDays(mon, sun);
////        System.out.println(">>> monsun dto = "+ dto);
//        return taskhubRepository.findByDays(mon, sun);
//    }

    public List<TaskhubDTO> findByDoDates(String mon, String sun) {
        return taskhubRepository.findByDoDates(mon, sun);
    }

    public TaskhubDTO findById(String taskId) {
        TaskhubDTO dto = taskhubRepository.findById(taskId);
        return dto;
//        return taskhubRepository.findById(taskId);
    }

    public int findNewId() {
        return taskhubRepository.findNewId();
    }

    public void updateTask(TaskhubDTO taskhubDTO) {
        taskhubRepository.updateTask(taskhubDTO);
    }

    @Transactional
    public void deleteTask(String taskId) {
        System.out.println("service delete: "+taskId);
        System.out.println("Starting assignOtherOrder...");
        taskhubRepository.assignOtherOrder(taskId);
        System.out.println("Starting rearrangeOrder...");
        taskhubRepository.rearrangeOrder(taskId);
        System.out.println("Starting deleteTask...");
        taskhubRepository.deleteTask(taskId);
        System.out.println("delete end...");
    }

    public List<TaskhubDTO> getCategories() {
        return taskhubRepository.getCategories();
    }

    public List<TaskhubDTO> findByStatus(String taskStatus) {
        return taskhubRepository.findByStatus(taskStatus);
    }
    @Transactional
    public void updateOrderAndDoDate(TaskhubDTO taskhubDTO) {
        try {
            if(taskhubDTO.getTask_status() != null) {
                System.out.println("taskhubDTO.getTask_status() != null");
                taskhubRepository.updateStatus(taskhubDTO.getTask_id(), taskhubDTO.getTask_status());
            }

            // case1: 이동하는 날짜그룹 상이
            if(!Objects.equals(taskhubDTO.getNew_do_date(), taskhubDTO.getOld_do_date())) {
                // 1. Update old DO_DATE TASK_ORDER
                System.out.println("Updating different day, old DO_DATE TASK_ORDER...");
                taskhubRepository.updateOrderAndDoDateInDifferentDate1(taskhubDTO);
                System.out.println("Updated different day, old DO_DATE TASK_ORDER.");

                // 2. Update new DO_DATE TASK_ORDER
                System.out.println("Updating different day, new DO_DATE TASK_ORDER...");
                taskhubRepository.updateOrderAndDoDateInDifferentDate2(taskhubDTO);
                System.out.println("Updated different day, new DO_DATE TASK_ORDER.");

                // 3. Update TASK_ID with new DO_DATE and TASK_ORDER
                System.out.println("Updating different day, task_id's date and order...");
                taskhubRepository.updateOrderAndDoDateOfTask(taskhubDTO);
                System.out.println("Updated different day, task_id's date and order.");
            } else { // case2: 이동하는 날짜그룹 동일
                // case2-1: Moving Downwards
                if(Integer.parseInt(taskhubDTO.getOld_order_idx()) < Integer.parseInt(taskhubDTO.getNew_order_idx())){
                    System.out.println("Updating same day, downwards...");
                    taskhubRepository.updateOrderAndDoDateInSameDateDown(taskhubDTO);
                    System.out.println("Updated same day, downwards.");
                } else { // case2-2: Moving Upwards
                    System.out.println("Updating same day, upwards...");
                    taskhubRepository.updateOrderAndDoDateInSameDateUp(taskhubDTO);
                    System.out.println("Updated same day, upwards.");
                }
                // Update TASK_ID with new DO_DATE and TASK_ORDER
                System.out.println("Updating same day, task_id's date and order...");
                taskhubRepository.updateOrderAndDoDateOfTask(taskhubDTO);
                System.out.println("Updated same day, task_id's date and order.");
            }

        } catch (DataAccessException e) {
            System.err.println("Failed to update task order and due date: " + e.getMessage());
            throw new RuntimeException("Failed to update task order and due date", e);
        }
    }

    @Transactional
    public void updateDetailDoDate(TaskhubDTO taskhubDTO) {
//        System.out.println("updateDetailDoDate doDates:: "+doDates);
        String[] dateArray;
        String taskId = taskhubDTO.getTask_id();
        String doDates = taskhubDTO.getDo_dates();
        String taskStatus = taskhubDTO.getTask_status();
        if (doDates == null || doDates.trim().isEmpty()) {
            dateArray = new String[] { "9999-12-31" };
            taskStatus = "";
        } else {
            dateArray = doDates.split(",");
        }
        System.out.println("1 Starting assignOtherOrder...");
        taskhubRepository.assignOtherOrder(taskId);
        System.out.println("2 Starting rearrangeOrder...");
        taskhubRepository.rearrangeOrder(taskId); // 해당 taskId가 들어간 모든 dodate들의 항목을 해당 태스크를 제외한 채 재정렬
        System.out.println("3 Starting deleteDoDatesByTaskId...");
        taskhubRepository.deleteDoDatesByTaskId(taskId); // 기존 DODATES 삭제
        System.out.println("4 deleteDoDatesByTaskId end...");

        for (String date : dateArray) {
            // TASK_ORDER 값을 계산하기 위한 로직 추가
            int taskOrder = taskhubRepository.getMaxTaskOrder(date);
            System.out.println("updateDetailDoDate taskOrder:: "+taskOrder+" / date: "+date);
            // 각 날짜를 DODATES 테이블에 삽입
            taskhubRepository.insertDoDate(taskId, date.trim(), taskOrder);
        }
        if(taskStatus != null && !taskStatus.isEmpty()) {
            System.out.println("5 Starting updateStatus..."+taskStatus);
            taskhubRepository.updateStatus(taskId, taskStatus);
            System.out.println("5 updateStatus end.");
        }
    }
    public Map<String, Object> getOldDoDateAndOrder(String taskId) {
        return taskhubRepository.getOldDoDateAndOrder(taskId);
    }

    public String getMaxIdxOfNewDate(String newDoDate) {
        return taskhubRepository.getMaxIdxOfNewDate(newDoDate);
    }
}
