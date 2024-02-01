using ESEIM.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("GO_ABOARD")]
    public class GoAboard
    {
		[Key]
		public int Id { get; set; }

        public string From { get; set; }
        public string  To { get; set; }
        public string Contact { get; set; }
        public string Country { get; set; }
        public string ProfileCode { get; set; }
        public bool IsDeleted {  get; set; }
    }
}
