using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CARD_FOR_W_OBJ")]
    public class CardForWObj
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [StringLength(255)]
        public string CatObjCode { get; set; }

        [NotMapped]
        public string CatObjName { get; set; }

        [StringLength(255)]
        public string ObjCode { get; set; }

        [NotMapped]
        public string ObjName { get; set; }

       [StringLength(255)]
        public string Relative { get; set; }

        [NotMapped]
        public string RelativeName { get; set; }

        [StringLength(255)]
        public string CardCode { get; set; }


        public DateTime CreatedTime { get; set; }

        [StringLength(255)]
        public string CreatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(255)]
        public string UpdatedBy { get; set; }

        public bool IsDeleted { get; set; }
    }
}
