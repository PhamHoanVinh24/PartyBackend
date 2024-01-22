using ESEIM.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Utils
{ 
    public interface IMailService
    {
        Task SendEmailAsync(MailRequest mailRequest);
    }
}
