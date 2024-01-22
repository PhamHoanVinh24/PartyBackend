using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("AD_ACTION_LOG")]
    public class AdActionLog
    {     
        public AdActionLog()
        {
        }

        public AdActionLog(IHttpContextAccessor accessor)
        {
            string browser = accessor.HttpContext.Request.Headers["User-Agent"];
            if (!string.IsNullOrEmpty(browser) && (browser.Length > 255))
            {
                browser = browser.Substring(0, 255);
            }

            CreatedDate = DateTime.Now;
            CreatedBy = accessor.HttpContext.User?.Identity?.Name;
            Browser = browser;
            ActionLogHost = accessor.HttpContext.Request.Host.ToString();
            ActionLogPath = accessor.HttpContext.Request.Path;
            IpAddress = accessor.HttpContext.Connection?.RemoteIpAddress?.ToString();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ActionLogId { get; set; }

        [StringLength(50)]
        public string LogLevel { get; set; }

        [StringLength(2000)]
        public string Message { get; set; }

        [StringLength(255)]
        public string CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }

        [StringLength(300)]
        public string Browser { get; set; }

        [StringLength(100)]
        public string ActionLogHost { get; set; }

        [StringLength(300)]
        public string ActionLogPath { get; set; }

        [StringLength(20)]
        public string IpAddress { get; set; }

        [StringLength(500)]
        public string ActionLogApplication { get; set; }

        //public string Data { get; set; }

        [StringLength(255)]
        public string TableModified { get; set; }

        [StringLength(2000)]
        public string DataOld { get; set; }

        [StringLength(2000)]
        public string DataNew { get; set; }
    }
}