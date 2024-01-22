using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("SERVICE_REGIST")]
    public class ServiceRegist
    {


        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string ServiceCode { get; set; }

        [StringLength(50)]
        public string ObjectType { get; set; }

        [StringLength(50)]
        public string ObjectCode { get; set; }


        public DateTime? BeginTime { get; set; }


        public DateTime? EndTime { get; set; }

        [StringLength(255)]
        public String Status { get; set; }

        [StringLength(255)]
        public String PaymentStatus { get; set; }

        [StringLength(50)]
        public string ServiceType { get; set; }

        [StringLength(1000)]
        public string LogPay { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }


        public bool? IsDeleted { get; set; } = false;

        [StringLength(1000)]
        public string LogAction { get; set; }
        [StringLength(255)]
        public string Note { get; set; }





    }

}