using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("SERVICE_CAT_COST_CONDITION")]
    public class ServiceCategoryCostCondition
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string HeaderCode { get; set; }

        [StringLength(255)]
        public string ServiceCatCode { get; set; }

        [StringLength(255)]
        public string ObjectCode { get; set; }

        [StringLength(255)]
        public string ObjFromValue { get; set; }

        [StringLength(255)]
        public string ObjToValue { get; set; }

        [StringLength(100)]
        public string Unit { get; set; }

        [StringLength(100)]
        public string ServiceUnit { get; set; }

        public decimal Price { get; set; }

        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        public decimal Rate { get; set; }

        [StringLength(255)]
        public string Currency { get; set; }

        [NotMapped]
        public int Priority { get; set; }

        [NotMapped]
        public string Type { get; set; }
    }
}
