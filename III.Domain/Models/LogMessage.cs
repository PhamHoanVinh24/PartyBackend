using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("LOG_MESSAGE")]
    public class LogMessage
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        public string GroupCode { get; set; }
        public string Channel { get; set; }
        public string Content { get; set; }
        public string User { get; set; }
        public DateTime TimeChat { get; set; }
        public string Image { get; set; }
        public string GivenName { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        [NotMapped]
        public string Time { get; set; }
        public bool IsFile { get; set; }
        public int? FileId { get; set; }
        public string Url { get; set; }
    }
}
