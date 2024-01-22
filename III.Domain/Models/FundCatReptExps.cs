using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("FUND_CAT_REPT_EXPS")]
    public class FundCatReptExps
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string CatCode { get; set; }
        [StringLength(255)]
        public string CatName { get; set; }

        [StringLength(255)]
        public string CatParent { get; set; }

        [NotMapped]
        public string CatParentName { get; set; }

        [StringLength(100)]
        public string CatType { get; set; }
        [MaxLength]
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
