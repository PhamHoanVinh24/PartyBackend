using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("NOTIFICATION_OBJECT")]
    public class NotificationObject
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string ObjType { get; set; }
        public string ObjCode { get; set; }
        public bool IsViewed { get; set; }
        public bool IsDeleted { get; set; }
        public string ListUser { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
    }
}
