using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("FUND_RELATIVE_OBJ_MNG")]
    public class FundRelativeObjMng
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(255)]
        public string ObjType { get; set; }
        [StringLength(255)]
        public string ObjCode { get; set; }
        [StringLength(255)]
        public string Relative { get; set; }
        [StringLength(255)]
        public string TickRecptPayCode { get; set; }

    }
}
