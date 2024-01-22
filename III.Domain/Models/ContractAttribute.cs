using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CONTRACT_ATTRIBUTE")]
    public class ContractAttribute
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ContractAttributeID { get; set; }


        [StringLength(100)]
        public string ContractCode { get; set; }

        public int? ContractVersion { get; set; }

        [StringLength(100)]
        public string AttrCode { get; set; }

        [StringLength(255)]
        public string AttrValue { get; set; }

        [StringLength(50)]
        public string AttrGroup { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
        public string Note { get; set; }
    }
}
