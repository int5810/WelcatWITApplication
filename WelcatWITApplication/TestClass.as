/* 下記のリファレンスからできそうな気もするが、現在難航中
 * https://help.adobe.com/ja_JP/FlashPlatform/reference/actionscript/3/flash/external/ExternalInterface.html
 * https://help.adobe.com/ja_JP/FlashPlatform/reference/actionscript/3/flash/net/Socket.html
 */

package
{
	import flash.display.*;
	import flash.external.ExternalInterface;
	
	public class TestClass extends Sprite
	{
		private var myclass :MyClass;
		
		public function TestClass()
		{
            myclass = new MyClass();
			if (ExternalInterface.available)
			{
				ExternalInterface.addCallback("flash_func", GetResponse);
			}
        }
		
		public function GetResponse():String
		{
			return myclass.GetResponse();
		}
	}
}

class MyClass
{
	private var response:String;
	
	public function MyClass()
	{
		response = "Construct";
	}
	
	public function GetResponse():String
	{
		return response;
	}
}