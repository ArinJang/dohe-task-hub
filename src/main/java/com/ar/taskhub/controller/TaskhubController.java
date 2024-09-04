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
    private static final Map<String, String> DATE_MAP = new HashMap<>();

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

    @PostMapping("/updateDetailDoDate")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateDetailDoDate(@RequestBody Map<String, Object> updateData) {
        String taskId = (String) updateData.get("task_id");
        String doDates = convertDate(getStringValue(updateData.get("do_dates")));
        String taskStatus = (String) updateData.get("task_status");

        TaskhubDTO taskhubDTO = new TaskhubDTO();
        taskhubDTO.setTask_id(taskId);
        taskhubDTO.setDo_dates(doDates);
        taskhubDTO.setTask_status(taskStatus);

        System.out.println(">>> updateDetailDoDate taskId:"+taskId+" /doDates:"+doDates+" /taskStatus:"+taskStatus);
        taskhubService.updateDetailDoDate(taskhubDTO);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Do dates successfully updated.");

        return ResponseEntity.ok(response);
    }

    static {
        DATE_MAP.put("NOTASSIGNED", "9999-12-31"); // 날짜 미할당 task
        DATE_MAP.put("4", "9999-01-04"); // task_status = "onhold"
        DATE_MAP.put("5", "9999-01-05"); // task_status = "delegation"
        DATE_MAP.put("6", "9999-01-06"); // task_status = "plan"
    }

    private static String convertDate(String date) {
        if (date == null) {
            return null;
        }
        return DATE_MAP.getOrDefault(date, date);
    }

    private static String getStringValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof String) {
            return (String) value;
        } else {
            return String.valueOf(value);
        }
    }

    @PostMapping("/updateOrderAndDoDate")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateOrderAndDoDate(@RequestBody Map<String, Object> updateData) {
        try {
            //updateOrderAndDoDate(fromDay, toDay,   oldIndex, newIndex, movedTaskId) {
            //updateOrderAndDoDate(null, '9999-01-04', null, null, sessionStorage.getItem('DetailID'));
            String taskId = (String) updateData.get("task_id");
            String oldDoDate = convertDate(getStringValue(updateData.get("old_do_date")));
            String newDoDate = convertDate(getStringValue(updateData.get("new_do_date")));
            String oldIdx = getStringValue(updateData.get("old_idx"));
            String newIdx = getStringValue(updateData.get("new_idx"));
            String taskStatus = (String) updateData.get("task_status");

            System.out.println("0 updateOrderAndDoDate task_id: " + taskId+" / taskStatus: "+taskStatus);
            System.out.println("0 do_date: " + oldDoDate+"->"+newDoDate+" // idx: " + oldIdx+"->"+newIdx);

            //if (oldDoDate == null || oldIdx == null || newIdx == null) {
            if (oldDoDate == null || oldDoDate.isEmpty() || oldIdx == null || oldIdx.isEmpty() || newIdx == null || newIdx.isEmpty()) {
                System.out.println("IF oldDoDate == null || oldIdx == null || newIdx == null ");
                Map<String, Object> oldValues = taskhubService.getOldDoDateAndOrder(taskId);
                newIdx = taskhubService.getMaxIdxOfNewDate(newDoDate);

                // Convert DO_DATE to String if it is a java.sql.Date
                Object oldDoDateObj = oldValues.get("old_do_date");
                if (oldDoDateObj instanceof Date) {
                    oldDoDate = ((Date) oldDoDateObj).toString(); // Convert to String in YYYY-MM-DD format
                } else {
                    oldDoDate = getStringValue(oldDoDateObj);
                }

                // Convert TASK_ORDER to String if it is an Integer
                Object oldOrderIdxObj = oldValues.get("old_order_idx");
                oldIdx = getStringValue(oldOrderIdxObj);
            }

            TaskhubDTO taskhubDTO = new TaskhubDTO();
            taskhubDTO.setTask_id(taskId);
            taskhubDTO.setOld_do_date(oldDoDate);
            taskhubDTO.setNew_do_date(newDoDate);
            taskhubDTO.setOld_order_idx(oldIdx);
            taskhubDTO.setNew_order_idx(newIdx);
            taskhubDTO.setTask_status(taskStatus);
            System.out.println("1 updateOrderAndDoDate task_id: " + taskhubDTO.getTask_id()+"/taskStatus: "+taskStatus);
            System.out.println("1 do_date: " + taskhubDTO.getOld_do_date()+"->"+taskhubDTO.getNew_do_date()+" // idx: " + taskhubDTO.getOld_order_idx()+"->"+taskhubDTO.getNew_order_idx());

            taskhubService.updateOrderAndDoDate(taskhubDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Task order and due date updated successfully.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            // Prepare and return error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to update task: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
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
