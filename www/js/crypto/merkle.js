// The MIT License (MIT)

// Copyright (c) 2014, 2015 AJoseph

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/**
 * @param {Buffer} buf1
 * @return {Buffer}
 */
function sha256x2 (buf1, buf2) {
	var sha256 = CryptoJS.algo.SHA256.create();
	sha256.update(converters.byteArrayToWordArray(buf1));
	sha256.update(converters.byteArrayToWordArray(buf2));
	var hash = sha256.finalize();
	return converters.wordArrayToByteArrayImpl(hash, false);
}

/**
 * @param {Buffer} buf1
 * @param {Buffer} buf2
 * @return {Buffer}
 */
function isEqual (buf1, buf2) {
  if (buf1.length !== buf2.length) {
    return false;
  }

  for (var i = 0; i < buf1.length; ++i) {
    if (buf1[i] !== buf2[i]) {
      return false;
    }
  }

  return true;
}

/**
 * @param {string[]} txIds
 * @param {number} txIndex
 * @return {ProofObject}
 */
getProof = function (txIds, txIndex) {
  var proof = {
    txId: txIds[txIndex],
    txIndex: txIndex,
    sibling: []
  };

  var tree = new Array(txIds.length);
  for (var i = 0; i < tree.length; ++i) {
	tree[i] = converters.hexStringToByteArray(txIds[i]);
  }
  var target = tree[txIndex];

  while (tree.length !== 1) {
    var newTree = new Array(~~((tree.length + 1) / 2));
    for (var j = 0; j < tree.length; j += 2) {
      var hash1 = tree[j];
      var hash2 = tree[Math.min(j + 1, tree.length - 1)];

      newTree[j / 2] = sha256x2(hash1, hash2);

      if (isEqual(target, hash1)) {
        proof.sibling.push(converters.byteArrayToHexString((hash2)));
        target = newTree[j / 2];
      } else if (isEqual(target, hash2)) {
        proof.sibling.push(converters.byteArrayToHexString((hash1)));
        target = newTree[j / 2];
      }
    }

    tree = newTree;
  }

  return proof;
};

/**
 * @param {ProofObject} proofObj
 * @return {string}
 */
getTxMerkle = function (proofObj) {
  var target = (converters.hexStringToByteArray(proofObj.txId));  
  var txIndex = proofObj.txIndex;
  var sibling = proofObj.sibling;

  for (var i = 0; i < proofObj.sibling.length; ++i, txIndex = ~~(txIndex / 2)) {
    if (txIndex % 2 === 1) {
		target = sha256x2((converters.hexStringToByteArray(sibling[i])), target);
    } else {
		target = sha256x2(target, (converters.hexStringToByteArray(sibling[i])));
    }
  }

  return converters.byteArrayToHexString((target));
};

/**
 * @param {string[]} txIds
 * @return {string}
 */
getMerkleRoot = function (txIds) {
  var tree = new Array(txIds.length);
  for (var i = 0; i < tree.length; ++i) {
	tree[i] = (converters.hexStringToByteArray(txIds[i]));
  }

  while (tree.length !== 1) {
    var newTree = new Array(~~((tree.length + 1) / 2));
    for (var j = 0; j < tree.length; j += 2) {
      var hash1 = tree[j];
      var hash2 = tree[Math.min(j + 1, tree.length - 1)];

      newTree[j / 2] = sha256x2(hash1, hash2);
    }

    tree = newTree;
  }

  return converters.byteArrayToHexString((tree[0]));
};
