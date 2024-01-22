using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("STOP_CONTRACT_HEADER")]
    public class StopContractHeader
    {
        public StopContractHeader()
        {
            ListStatus = new List<JsonLog>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string DecisionNum { get; set; }
        public string Title { get; set; }
        public DateTime? DecisionDate { get; set; }
        [NotMapped]
        public string sDecisionDate { get; set; }
        public string Noted { get; set; }
        public string DecisionBy { get; set; }
        public string ApprovedBy { get; set; }
        public DateTime? ApprovedTime { get; set; }
        public string Status { get; set; }
        public string Flag { get; set; }
        public string WorkflowCat { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }

        [NotMapped]
        public List<JsonLog> ListStatus { get; set; }

        public string JsonData
        {
            get;set;
        }
        [NotMapped]
        public string ActRepeat { get; set; }
        [NotMapped]
        public string UserName { get; set; }

        [NotMapped]
        public int? WfInstId { get; set; }
    }
}

