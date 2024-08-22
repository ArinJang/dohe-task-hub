package com.ar.taskhub.service;

import com.ar.taskhub.dto.TaskhubDTO;
import com.ar.taskhub.repository.TaskhubRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskhubService {
    private final TaskhubRepository taskhubRepository;

    public void save(TaskhubDTO taskhubDTO) {
        taskhubRepository.save(taskhubDTO);
    }

    public List<TaskhubDTO> findAll(){
        return taskhubRepository.findAll();
    }

    public List<TaskhubDTO> findByDays(String mon, String sun) {
//        List<TaskhubDTO> dto = taskhubRepository.findByDays(mon, sun);
//        System.out.println(">>> monsun dto = "+ dto);
        return taskhubRepository.findByDays(mon, sun);
    }

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

    public void deleteTask(String taskId) {
        taskhubRepository.deleteTask(taskId);
    }

    public List<TaskhubDTO> getCategories() {
        return taskhubRepository.getCategories();
    }

    public List<TaskhubDTO> findByStatus(String taskStatus) {
        return taskhubRepository.findByStatus(taskStatus);
    }
}
