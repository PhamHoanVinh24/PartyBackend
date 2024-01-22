using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("SERVICE_CAT_COST_HEADER")]
    public class ServiceCategoryCostHeader
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string HeaderCode { get;set; }

        [StringLength(255)]
        public string Title { get; set; }

        public DateTime EffectiveDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string Note { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        [StringLength(50)]
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
        [NotMapped]
        public string sEffectiveDate { get; set; }
        [NotMapped]
        public string sExpiryDate { get; set; }

        [StringLength(255)]
        public string ResponsibleUser { get; set; }

        [StringLength(255)]
        public string Status { get; set; }
        [NotMapped]
        public string GivenName { get; set; }
    }
}
