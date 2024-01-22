using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("EDMS_REPOSITORY")]
    public class EDMSRepository
    {
        public EDMSRepository()
        {
        }
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ReposID { get; set; }

        [StringLength(100)]
        public string ReposCode { get; set; }

        [StringLength(255)]
        public string ReposName { get; set; }

        [StringLength(50)]
        public string Account { get; set; }

        [StringLength(255)]
        public string Server { get; set; }

        [StringLength(255)]
        public string Token { get; set; }

        //[StringLength(255)]
        //public string PathPhysic { get; set; }

        [StringLength(500)]
        public string Desc { get; set; }
        [StringLength(100)]
        public string Parent { get; set; }

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

        public string PassWord { get; set; }

        public string Type { get; set; }
    }
}