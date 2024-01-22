using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("URENCO_COST_CATEGORY_ATTRIBUTE")]
    public class UrencoCostCategoryAttribute
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string AttributeCode { get; set; }

        [StringLength(255)]
        public string AttributeName { get; set; }

        public string AttributeValue { get; set; }

        [StringLength(255)]
        public string FieldType { get; set; }

        [StringLength(500)]
        public string Note { get; set; }

        [StringLength(255)]
        public string ServiceCode { get;set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public bool IsDeleted { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }
    }
}
