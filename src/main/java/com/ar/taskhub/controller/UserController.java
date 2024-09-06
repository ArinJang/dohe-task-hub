package com.ar.taskhub.controller;

import com.ar.taskhub.dto.UserDTO;
import com.ar.taskhub.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
public class UserController {
    // 생성자 주입
    private final UserService userService;

//    // 회원가입 페이지 출력 요청
//    @GetMapping("/user/save")
//    public String saveForm() {
//        return "save";
//    }

    @PostMapping("/user/save")
    public String save(@ModelAttribute UserDTO userDTO) {
        System.out.println("UserController.save");
        System.out.println("userDTO = " + userDTO);
        userService.save(userDTO);
        return "index";
    }

//    @GetMapping("/user/login")
//    public String loginForm() {
//        return "login";
//    }

    @PostMapping("/user/login")
    public String login(@ModelAttribute UserDTO userDTO, HttpSession session) {
        UserDTO loginResult = userService.login(userDTO);
        if (loginResult != null) {
            // login 성공
            System.out.println("LOGIN SUCCESS>_<");
            session.setAttribute("loginUserName", loginResult.getUserName());
            session.setAttribute("loginUserId", loginResult.getUserId());
            return "redirect:/";

        } else {
            // login 실패
            return "redirect:/index";
        }
    }
//
//    @GetMapping("/user/")
//    public String findAll(Model model) {
//        List<UserDTO> userDTOList = userService.findAll();
//        // 어떠한 html로 가져갈 데이터가 있다면 model사용
//        model.addAttribute("userList", userDTOList);
//        return "list";
//    }
//
//    @GetMapping("/user/{id}")
//    public String findById(@PathVariable Long id, Model model) {
//        UserDTO userDTO = userService.findById(id);
//        model.addAttribute("user", userDTO);
//        return "detail";
//    }
//
//    @GetMapping("/user/update")
//    public String updateForm(HttpSession session, Model model) {
//        String myEmail = (String) session.getAttribute("loginEmail");
//        UserDTO userDTO = userService.updateForm(myEmail);
//        model.addAttribute("updateUser", userDTO);
//        return "update";
//    }
//
//    @PostMapping("/user/update")
//    public String update(@ModelAttribute UserDTO userDTO) {
//        userService.update(userDTO);
//        return "redirect:/user/" + userDTO.getId();
//    }
//
//    @GetMapping("/user/delete/{id}")
//    public String deleteById(@PathVariable Long id) {
//        userService.deleteById(id);
//        return "redirect:/user/";
//    }
//
//    @GetMapping("/user/logout")
//    public String logout(HttpSession session) {
//        session.invalidate();
//        return "index";
//    }
//
//    @PostMapping("/user/email-check")
//    public @ResponseBody String emailCheck(@RequestParam("userEmail") String userEmail) {
//        System.out.println("userEmail = " + userEmail);
//        String checkResult = userService.emailCheck(userEmail);
//        return checkResult;
////        if (checkResult != null) {
////            return "ok";
////        } else {
////            return "no";
////        }
//    }

}
