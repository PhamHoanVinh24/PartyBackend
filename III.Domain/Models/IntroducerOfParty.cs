using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
	[Table("INTRODUCER_OF_PARTY")]
	public class IntroducerOfParty
	{
		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int id { get; set; }

		[StringLength(maximumLength: 150)]
		public string PersonIntroduced { get; set; }

		[StringLength(maximumLength: 150)]
		public string PlaceNTimeJoinUnion { get; set; }
		
		[StringLength(maximumLength: 150)]
		public string PlaceNTimeJoinParty1st { get; set; }
		
		[StringLength(maximumLength: 150)]
		public string PlaceNTimeJoinRecognize1st { get; set; }
		public string ProfileCode {  get; set; }
		public bool IsDeleted { get; set; }

	}
}
