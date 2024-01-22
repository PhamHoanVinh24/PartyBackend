using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PAY_DECISION_HEADER")]
    public class PayDecisionHeader
    {
        public PayDecisionHeader()
        {
            ListStatus = new List<JsonLog>();
        }
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string DecisionNum { get; set; }

        [NotMapped]
        public string DecisionDate { get; set; }

        public string Title { get; set; }

        public string Noted { get; set; }

        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        public string WorkflowCat { get; set; }

        [NotMapped]
        public List<JsonLog> ListStatus { get; set; }
        [NotMapped]
        public string ActRepeat { get; set; }

        public string Status { get; set; }

        public string JsonData { get; set; }
        [NotMapped]
        public int? WfInstId { get; set; }
    }

    public class LogData
    {
        public string Header { get; set; }
        public string Details { get; set; }
    }
}
