using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("WORK_ITEM_ASSIGN_STAFF")]
    public class WorkItemAssignStaff
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        public string UserId { get; set; }
        public string Object_G_D { get; set; }
        public string ObjectType { get; set; }
        public string CardCode { get; set; }
        public string CheckItem { get; set; }
        public string CheckListCode { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
        public string EstimateTime { get; set; }
        public string Unit { get; set; }
    }
}
