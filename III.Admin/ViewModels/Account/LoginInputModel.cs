// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.


using System.ComponentModel.DataAnnotations;

namespace Hot.Models.AccountViewModels
{
    public class LoginInputModel
    {
        //[Required(ErrorMessage = "Tên đăng nhập không được để trống")]
        public string Username { get; set; }
        //[Required(ErrorMessage = "Mật khẩu không được để trống")]
        [DataType(DataType.Password)]
        public string Password { get; set; }
        public string OTP { get; set; }
        public bool RememberLogin { get; set; }
        public string ReturnUrl { get; set; }
    }
}