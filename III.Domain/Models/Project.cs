using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("PROJECT")]
    public class Project
    {
        public Project()
        {
            ListStatusObjectLog = new List<JsonLog>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]

        public int Id { get; set; }

        [StringLength(100)]
        public string ProjectCode { get; set; }

        [StringLength(255)]
        public string ProjectTitle { get; set; }

        public double? Budget { get; set; }

        [StringLength(50)]
        public string Currency { get; set; }

        [StringLength(50)]
        public string PrjSkillKeyword { get; set; }

        [StringLength(50)]
        public string PrjStatus { get; set; }

        public double? SetPriority { get; set; }

        [StringLength(100)]
        public string PrjMode { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public int? Version { get; set; }

        public string Language { get; set; }

        [StringLength(50)]
        public string PrjType { get; set; }

        [StringLength(50)]
        public string CaseWorker { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public bool FlagDeleted { get; set; }

        [StringLength(500)]
        public string GoogleMap { get; set; }

        [StringLength(500)]
        public string Address { get; set; }

        [StringLength(100)]
        public string CustomerCode { get; set; }

        [StringLength(100)]
        public string SupplierCode { get; set; }
        public string Status { get; set; }
        public string WorkflowCat { get; set; }
        public string ListUserView { get; set; }
        public string StatusObject { get; set; }
        public string StatusObjectLog
        {
            get
            {
                return JsonConvert.SerializeObject(ListStatusObjectLog);
            }
            set
            {
                ListStatusObjectLog = string.IsNullOrEmpty(value)
                ? new List<JsonLog>()
                : JsonConvert.DeserializeObject<List<JsonLog>>(value);
            }
        }

        [NotMapped]
        public List<JsonLog> ListStatusObjectLog { get; set; }
    }
    public class ProjectType
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Color { get; set; }
    }
    public class ProjectModel
    {
        public ProjectModel()
        {
            ListStatusObjectLog = new List<JsonLog>();
        }

        [Required]
        public string ProjectCode { get; set; }

        [Required]
        public string ProjectTitle { get; set; }

        public string Currency { get; set; }

        public string Budget { get; set; }

        [Required]
        public string StartTime { get; set; }

        [Required]
        public string EndTime { get; set; }

        public string SetPriority { get; set; }

        [Required]
        public string CustomerCode { get; set; }

        public string SupplierCode { get; set; }

        public string PrjType { get; set; }

        public string GoogleMap { get; set; }

        public string Address { get; set; }
        public string Status { get; set; }
        public string WorkflowCat { get; set; }
        public string StatusObject { get; set; }
        public string StatusObjectLog
        {
            get
            {
                return JsonConvert.SerializeObject(ListStatusObjectLog);
            }
            set
            {
                ListStatusObjectLog = string.IsNullOrEmpty(value)
                ? new List<JsonLog>()
                : JsonConvert.DeserializeObject<List<JsonLog>>(value);
            }
        }

        [NotMapped]
        public List<JsonLog> ListStatusObjectLog
        {
            get; set;
        }
    }
}
