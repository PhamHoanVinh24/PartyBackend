using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CONTRACT_DETAIL")]
    public class ContractDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ContractDetailID { get; set; }

        [StringLength(100)]
        public string ItemCode { get; set; }

        [StringLength(255)]
        public string ItemName { get; set; }

        public decimal Quatity { get; set; }

        [StringLength(50)]
        public string Unit { get; set; }

        public decimal Cost { get; set; }

        [StringLength(100)]
        public string ContractCode { get; set; }

        public int ContractVersion { get; set; }

        [StringLength(500)]
        public string Note { get; set; }

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
