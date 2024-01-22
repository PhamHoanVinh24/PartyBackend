using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("RECORDS_PACK_ARRANGE_LOG")]
    public class RecordPackArrangeLog
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string Action { get; set; }

        public string ObjectType { get; set; }

        public string ObjectCode { get; set; }

        public string Message { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }
        
    }
}
