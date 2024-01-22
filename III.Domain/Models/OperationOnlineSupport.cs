using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("OPERATION_ONLINE_SUPPORT")]
    public class OperationOnlineSupport
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]

        public int Id { get; set; }
        [StringLength(maximumLength: 255)]
        public string UserName { get; set; }
        public string PassWord { get; set; }

        public string TitleName { get; set; }
        public string UserType { get; set; }
        public DateTime? LastCallTime { get; set; }
        public string LocationCall { get; set; }
        public string Status { get; set; }

        public DateTime CreatedTime { get; set; }
        public string CreatedBy { get; set; }
        public DateTime UpdatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public bool IsDeleted { get; set; }

         
    }
}