using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("PROD_QC_DATASET_RESULTS")]
    public class ProdQcDatasetResults
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int IdQcDetails { get; set; }
        [StringLength(100)]
        public string AttrCode { get; set; }
        [StringLength(255)]
        public string AttrGroup { get; set; }
        public string SessionCode { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
        public string Unit { get; set; }
        public string Type { get; set; }
        public string Value { get; set; }
    }
}
