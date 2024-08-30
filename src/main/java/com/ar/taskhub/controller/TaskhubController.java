package com.ar.taskhub.controller;

import com.ar.taskhub.dto.TaskhubDTO;
import com.ar.taskhub.service.TaskhubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskhubController {
    private static final Logger logger = LoggerFactory.getLogger(TaskhubController.class);
    private final TaskhubService taskhubService;

    @GetMapping("/save")
    public String save() {
        System.out.println(">>> TaskhubController.save 1");
        return "save";
    }

    @GetMapping("/tasksNotAssigned")
    public List<TaskhubDTO> getTasksNotAssigned() {
        return taskhubService.findAll();
    }

    @PostMapping("/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> save(@RequestParam(value = "task_content", required = true) String taskContent,
                                                    @RequestParam(value = "work_name", required = false) String workName,
                                                    @RequestParam(value = "do_dates", required = false) String do_dates,
                                                    @RequestParam("action") String action) {
        System.out.println(">>> TaskhubController.save 2 Action: "+ action);
        TaskhubDTO taskhubDTO = new TaskhubDTO();

        if ("TASK+".equals(action)) {
            taskhubDTO.setTask_content(taskContent);
            taskhubDTO.setDo_dates(do_dates);
        } else if ("WORK+".equals(action)) {
            taskhubDTO.setWork_name(workName);
        } else {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Invalid action"));
        }

        taskhubService.save(taskhubDTO);

        // Return a JSON response
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Task or Work saved successfully.");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/tasks")
    public List<TaskhubDTO> getTasksByDateRange(@RequestParam(value = "baseDate", required = false) String baseDate) {
        LocalDate today;

        if (baseDate != null && !baseDate.isEmpty()) {
            today = LocalDate.parse(baseDate); // 문자열을 LocalDate로 변환
//            System.out.println("baseDate passed::: "+baseDate);
//            System.out.println("baseDate parsed::: "+today);
        } else {
            today = LocalDate.now(); // baseDate가 없으면 현재 날짜를 사용
//            System.out.println("baseDate is null");
        }

        LocalDate monday = getMonday(today);
        LocalDate sunday = getSunday(today);
        String mon = formatDate(monday);
        String sun = formatDate(sunday);

        return taskhubService.findByDoDates(mon, sun);
    }

    @GetMapping("/findByStatus/{taskStatus}")
    public List<TaskhubDTO> getTasksByStatus(@PathVariable("taskStatus") String taskStatus) {
        return taskhubService.findByStatus(taskStatus);
    }

    @GetMapping("/tasksAdded")
    public List<TaskhubDTO> getTasks() {
        return taskhubService.findAll();
    }

    @GetMapping("/newId")
    public int findNewId() {
        return taskhubService.findNewId();
    }

    @GetMapping("/findById/{task_id}")
    public TaskhubDTO findById(@PathVariable("task_id") String taskId) {
        return taskhubService.findById(taskId);
    }

    @PostMapping("/updateTask/{taskId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateTask(
            @PathVariable("taskId") String taskId,
            @RequestBody TaskhubDTO taskhubDTO) {
        System.out.println(">>> TaskhubController.updateTask taskid: "+taskId);
        System.out.println("TaskhubDTO: " + taskhubDTO);

        // Set the task ID in the DTO and update the task
        taskhubDTO.setTask_id(taskId);
        taskhubService.updateTask(taskhubDTO);

        // Return a JSON response
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Task updated successfully.");

        return ResponseEntity.ok(response);
    }


    @PostMapping("/updateDetailDoDate/{taskId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateDetailDoDate(
            @PathVariable("taskId") String taskId,
            @RequestBody Map<String, String> requestData) {
        System.out.println(">>> TaskhubController.updateDetailDoDate taskid: "+taskId);
        String doDates = requestData.get("do_dates");
        taskhubService.updateDetailDoDate(taskId, doDates);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Do dates successfully updated."));
    }

    @PostMapping("/updateOrderAndDoDate")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateOrderAndDoDate(@RequestBody Map<String, Object> updateData) {
        try {
            //updateOrderAndDoDate(fromDay, toDay,   oldIndex, newIndex, movedTaskId) {
            //updateOrderAndDoDate(null, '9999-01-04', null, null, sessionStorage.getItem('DetailID'));
            String taskId = (String) updateData.get("task_id");
            String oldDoDate = "NOTASSIGNED".equals(updateData.get("old_do_date")) ? "9999-12-31" : (String) updateData.get("old_do_date");
            String newDoDate = "NOTASSIGNED".equals(updateData.get("new_do_date")) ? "9999-12-31" : (String) updateData.get("new_do_date");
            String oldIdx = String.valueOf(updateData.get("old_idx"));
            String newIdx = String.valueOf(updateData.get("new_idx"));
//            if (taskId == null || newDoDate == null || oldIdx == null || newIdx == null) {
//                return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Invalid input data"));
//            }

//            System.out.println("updateOrderAndDoDate 111 do_date: " + oldDoDate+"->"+newDoDate);
//            System.out.println("updateOrderAndDoDate 111 idx: " + oldIdx+"->"+newIdx);
            if (oldDoDate == null || oldIdx == null || newIdx == null) {
                Map<String, Object> oldValues = taskhubService.getOldDoDateAndOrder(taskId);
                newIdx = taskhubService.getMaxIdxOfNewDate(newDoDate);

                // Convert DO_DATE to String if it is a java.sql.Date
                Object oldDoDateObj = oldValues.get("old_do_date");
                if (oldDoDateObj instanceof java.sql.Date) {
                    java.sql.Date sqlDate = (java.sql.Date) oldDoDateObj;
                    oldDoDate = sqlDate.toString(); // Convert to String in YYYY-MM-DD format
                } else if (oldDoDateObj instanceof String) {
                    oldDoDate = (String) oldDoDateObj;
                }

                // Convert TASK_ORDER to String if it is an Integer
                Object oldOrderIdxObj = oldValues.get("old_order_idx");
                if (oldOrderIdxObj instanceof Integer) {
                    oldIdx = String.valueOf(oldOrderIdxObj); // Convert Integer to String
                } else if (oldOrderIdxObj instanceof String) {
                    oldIdx = (String) oldOrderIdxObj;
                }
            }
//            if (newIdx == null) {
//                System.out.println("newIdx == null ");
//                newIdx = taskhubService.getMaxIdxOfNewDate(newDoDate);
//                System.out.println("updateOrderAndDoDate 111 idx: " + oldIdx+"->"+newIdx);
//            }

            TaskhubDTO taskhubDTO = new TaskhubDTO();
            taskhubDTO.setTask_id(taskId);
            taskhubDTO.setOld_do_date(oldDoDate);
            taskhubDTO.setNew_do_date(newDoDate);
            taskhubDTO.setOld_order_idx(oldIdx);
            taskhubDTO.setNew_order_idx(newIdx);
            System.out.println("updateOrderAndDoDate task_id: " + taskhubDTO.getTask_id());
            System.out.println("updateOrderAndDoDate do_date: " + taskhubDTO.getOld_do_date()+"->"+taskhubDTO.getNew_do_date());
            System.out.println("updateOrderAndDoDate idx: " + taskhubDTO.getOld_order_idx()+"->"+taskhubDTO.getNew_order_idx());

//            logger.info("updateOrderAndDoDate DTO task_id: {}", taskhubDTO.getTask_id());
//            logger.info("updateOrderAndDoDate DTO Old_do_date: {}", taskhubDTO.getOld_do_date());
//            logger.info("updateOrderAndDoDate DTO New_do_date: {}", taskhubDTO.getNew_do_date());
//            logger.info("updateOrderAndDoDate DTO Old_order_idx: {}", taskhubDTO.getOld_order_idx());
//            logger.info("updateOrderAndDoDate DTO New_order_idx: {}", taskhubDTO.getNew_order_idx());

            taskhubService.updateOrderAndDoDate(taskhubDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Task order and due date updated successfully.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("status", "error", "message", "Failed to update task"));
        }
    }



    @DeleteMapping("/deleteTask/{taskId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteTask(@PathVariable("taskId") String taskId) {
        System.out.println(">>> TaskhubController.deleteTask Task ID: " + taskId);
        try {
            // Call the service layer to delete the task
            taskhubService.deleteTask(taskId);

            // Return a JSON response
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Task deleted successfully.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Handle error (e.g., task not found)
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to delete task. Task might not exist.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/categories")
    public List<TaskhubDTO> getCategories() {
        return taskhubService.getCategories();
    }

    // 현재 날짜를 기준으로 해당 주의 월요일 날짜를 구하는 메소드
    public static LocalDate getMonday(LocalDate date) {
        return date.with(DayOfWeek.MONDAY);
    }

    // 현재 날짜를 기준으로 해당 주의 일요일 날짜를 구하는 메소드
    public static LocalDate getSunday(LocalDate date) {
        return date.with(DayOfWeek.SUNDAY);
    }
    // 날짜를 문자열로 포맷하는 메소드
    public static String formatDate(LocalDate date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        return date.format(formatter);
    }
}
