using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("DISPATCHES_CATEGORY")]
    public class DispatchesCategory
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(50)]
        public string Code { get; set; }

        [StringLength(255)]
        public string Name { get; set; }

        [StringLength(10)]
        public string Type { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }


        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        [StringLength(255)]
        public string DocumentType { get; set; }

        public int NumberCreator { get; set; }

        [StringLength(255)]
        public string DocumentSymbol { get; set; }

        public int ExpriedProcess { get; set; }

        public bool IsYearBefore { get; set; }
        public int Year { get; set; }
        public string TypeM { get; set; }
    }
}
