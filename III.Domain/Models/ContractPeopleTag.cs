using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("CONTRACT_PEOPLE_TAGS")]
    public class ContractPeopleTag
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ContractPeopleTagID { get; set; }

        [StringLength(100)]
        public string ContractCode { get; set; }

        public string Assigner { get; set; }

        public DateTime? RequestTime { get; set; }

        [StringLength(100)]
        public string Confirm { get; set; }

        public DateTime? ConfirmTime { get; set; }

        [StringLength(50)]
        public string TagsType { get; set; }

        public bool Flags { get; set; }
       
        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
    }
}
